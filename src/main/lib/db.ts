import sql from 'mssql'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

export async function testMssqlConnection(connectionString: string): Promise<boolean> {
  console.log('Testing connection string: ', connectionString)
  const pool = new sql.ConnectionPool(connectionString)
  try {
    await pool.connect()
    await pool.close()
    return true
  } catch (error) {
    console.error('Failed to connect to MSSQL: ', error)
    return false
  }
}

export async function runQuery(connectionString: string, query: string) {
  const pool = new sql.ConnectionPool(connectionString)
  await pool.connect()
  const result = await pool.request().query(query)
  await pool.close()
  console.log('Query result: ', result)
  return result
}

export async function generateQuery(
  input: string,
  connectionString: string,
  openAiKey: string,
  existingQuery: string,
  openAiUrl?: string,
  openAiModel?: string
) {
  try {
    const openai = createOpenAI({
      apiKey: openAiKey,
      baseURL: openAiUrl || undefined
    })
    const tableSchema = await getTableSchema(connectionString)
    const existing = existingQuery.trim()

    // Use provided model or default to gpt-4o
    const modelToUse = openAiModel || 'gpt-4o'

    const result = await generateObject({
      model: openai(modelToUse),
      system: `You are a SQL (MSSQL) and data visualization expert. Your job is to help the user write or modify a SQL query to retrieve the data they need. The table schema is as follows:
      ${tableSchema}
      Only retrieval queries are allowed.

      ${existing.length > 0 ? `The user's existing query is: ${existing}` : ``}

      format the query in a way that is easy to read and understand.
      wrap table names in square brackets
    `,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
      schema: z.object({
        query: z.string()
      }),
      providerOptions: {
        openai: {
          apiKey: openAiKey
        }
      }
    })
    return result.object.query
  } catch (e: any) {
    console.error(e)
    throw new Error('Failed to generate query: ' + e.message)
  }
}

export async function getTableSchema(connectionString: string) {
  const pool = new sql.ConnectionPool(connectionString)
  await pool.connect()
  const schemaQuery = `
    SELECT
      t.name AS table_name,
      c.name AS column_name,
      ty.name AS data_type,
      c.max_length AS character_maximum_length,
      CASE WHEN c.is_nullable = 1 THEN 'YES' ELSE 'NO' END AS is_nullable,
      OBJECT_DEFINITION(c.default_object_id) AS column_default,
      CASE
        WHEN pk.is_primary_key = 1 THEN 'PRIMARY KEY'
        WHEN fk.parent_object_id IS NOT NULL THEN 'FOREIGN KEY'
        ELSE NULL
      END AS constraint_type,
      ft.name AS foreign_table_name,
      fc.name AS foreign_column_name
    FROM sys.tables t
      JOIN sys.columns c ON t.object_id = c.object_id
      JOIN sys.types ty ON c.user_type_id = ty.user_type_id
      LEFT JOIN (
        SELECT i.object_id, ic.column_id, i.is_primary_key
        FROM sys.indexes i
          JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        WHERE i.is_primary_key = 1
      ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
      LEFT JOIN sys.foreign_key_columns fk ON c.object_id = fk.parent_object_id AND c.column_id = fk.parent_column_id
      LEFT JOIN sys.tables ft ON fk.referenced_object_id = ft.object_id
      LEFT JOIN sys.columns fc ON fk.referenced_object_id = fc.object_id AND fk.referenced_column_id = fc.column_id
    ORDER BY t.name, c.column_id;
  `

  const res = await pool.request().query(schemaQuery)
  await pool.close()
  const metadata = res.recordset as any[]

  // Format the schema information into a readable string
  const schemaInfo = metadata.reduce((acc: Record<string, any[]>, row) => {
    if (!acc[row.table_name]) {
      acc[row.table_name] = []
    }

    let columnDef = `${row.column_name} ${row.data_type}`
    if (row.character_maximum_length) {
      columnDef += `(${row.character_maximum_length})`
    }
    if (row.is_nullable === 'NO') {
      columnDef += ' NOT NULL'
    }
    if (row.constraint_type === 'PRIMARY KEY') {
      columnDef += ' PRIMARY KEY'
    }
    if (row.constraint_type === 'FOREIGN KEY') {
      columnDef += ` REFERENCES ${row.foreign_table_name}(${row.foreign_column_name})`
    }
    if (row.column_default) {
      columnDef += ` DEFAULT ${row.column_default}`
    }

    acc[row.table_name].push(columnDef)
    return acc
  }, {})

  // Convert to CREATE TABLE format
  return Object.entries(schemaInfo)
    .map(([tableName, columns]) => `${tableName} (\n  ${columns.join(',\n  ')}\n)`)
    .join('\n\n')
}
