const deleteTable = async (properties) => {
  const { provider, tableName } = properties

  const SDK = provider.getSdk()
  const ddb = new SDK.DynamoDB()

  try {
    return await ddb
      .deleteTable({
        TableName: tableName
      })
      .promise()
  } catch (error) {
    if (error.code !== 'ResourceNotFoundException') {
      throw error
    }
    return true
  }
}

export default deleteTable
