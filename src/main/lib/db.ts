import pg from 'pg'

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
