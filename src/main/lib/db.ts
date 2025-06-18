import pg from 'pg'
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from 'zod'

export async function testPostgresConnection(connectionString: string): Promise<boolean> {
  console.log('Testing connection string: ', connectionString)
  const client = new pg.Client({ connectionString })
  try {
    await client.connect()
    await client.end()
    return true
  } catch (error) {
    console.error('Failed to connect to pg: ', error)
    return false
  }
}

export async function runQuery(connectionString: string, query: string) {
  const client = new pg.Client({ connectionString })
  await client.connect()
  const result = await client.query(query)
  await client.end()
  console.log('Query result: ', result)
  return result
}

export async function generateQuery(
  input: string,
  connectionString: string,
  openAiKey: string,
  existingQuery: string
) {
  try {
    const tableSchema = await getTableSchema(connectionString)
    const existing = existingQuery.trim()

    const result = await generateObject({
      model: openai('gpt-4o'),
      system: `You are a SQL (postgres) and data visualization expert. Your job is to help the user write or modify a SQL query to retrieve the data they need. The table schema is as follows:
      ${tableSchema}
      Only retrieval queries are allowed.

      ${existing.length > 0 ? `The user's existing query is: ${existing}` : ``}

      format the query in a way that is easy to read and understand.
      wrap table names in double quotes
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
  const client = new pg.Client({ connectionString })
  await client.connect()
  const schemaQuery = `
    SELECT 
      t.table_name,
      c.column_name,
      c.data_type,
      c.character_maximum_length,
      c.is_nullable,
      c.column_default,
      tc.constraint_type,
      cc.table_name AS foreign_table_name,
      cc.column_name AS foreign_column_name
    FROM 
      information_schema.tables t
    JOIN 
      information_schema.columns c ON t.table_name = c.table_name
    LEFT JOIN 
      information_schema.key_column_usage kcu ON t.table_name = kcu.table_name AND c.column_name = kcu.column_name
    LEFT JOIN 
      information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
    LEFT JOIN 
      information_schema.constraint_column_usage cc ON tc.constraint_name = cc.constraint_name
    WHERE 
      t.table_schema = 'public'
    ORDER BY 
      t.table_name, c.ordinal_position;
  `

  const res = await client.query(schemaQuery)
  const metadata = res.rows as any[]

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
