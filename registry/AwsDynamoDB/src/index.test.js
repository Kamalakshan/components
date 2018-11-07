import AWS from 'aws-sdk'
import path from 'path'
import { deserialize, resolveComponentEvaluables, serialize } from '../../../src/utils'
import { createTestContext } from '../../../test'

beforeEach(async () => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('AwsDynamoDB', () => {
  const cwd = path.resolve(__dirname, '..')
  let context
  let provider
  let AwsProvider
  let AwsDynamoDB

  beforeEach(async () => {
    context = await createTestContext({ cwd })
    AwsProvider = await context.loadType('AwsProvider')
    AwsDynamoDB = await context.loadType('./')
    provider = await context.construct(AwsProvider, {})
  })

  it('should deploy the table when none exists', async () => {
    let awsDynamoDb = await context.construct(AwsDynamoDB, {
      provider,
      tableName: 'test-table'
    })
    awsDynamoDb = await context.defineComponent(awsDynamoDb)
    awsDynamoDb = resolveComponentEvaluables(awsDynamoDb)

    await awsDynamoDb.deploy(null, context)

    expect(AWS.mocks.createTableMock).toBeCalledWith({ TableName: 'test-table' })
  })

  it('should update when table name has changed', async () => {
    let awsDynamoDb = await context.construct(AwsDynamoDB, {
      provider,
      tableName: 'test-table'
    })
    awsDynamoDb = await context.defineComponent(awsDynamoDb)
    awsDynamoDb = resolveComponentEvaluables(awsDynamoDb)
    await awsDynamoDb.deploy(null, context)

    const prevAwsDynamoDb = await deserialize(serialize(awsDynamoDb, context), context)

    let nextAwsDynamoDb = await context.construct(AwsDynamoDB, {
      provider: await context.construct(AwsProvider, {}),
      tableName: 'updated-test-table'
    })
    nextAwsDynamoDb = await context.defineComponent(nextAwsDynamoDb, prevAwsDynamoDb)
    nextAwsDynamoDb = resolveComponentEvaluables(nextAwsDynamoDb)

    await nextAwsDynamoDb.deploy(prevAwsDynamoDb, context)

    expect(AWS.mocks.createTableMock).toBeCalledWith({ TableName: 'updated-test-table' })
  })

  it('should preserve props if nothing changed', async () => {
    let awsDynamoDb = await context.construct(AwsDynamoDB, {
      provider,
      tableName: 'test-table'
    })

    awsDynamoDb = await context.defineComponent(awsDynamoDb)
    awsDynamoDb = resolveComponentEvaluables(awsDynamoDb)
    await awsDynamoDb.deploy(null, context)

    const prevAwsDynamoDb = await deserialize(serialize(awsDynamoDb, context), context)

    let nextAwsDynamoDb = await context.construct(AwsDynamoDB, {
      provider,
      tableName: 'test-table'
    })
    nextAwsDynamoDb = await context.defineComponent(nextAwsDynamoDb, prevAwsDynamoDb)
    nextAwsDynamoDb = resolveComponentEvaluables(nextAwsDynamoDb)
    expect(nextAwsDynamoDb).toEqual(prevAwsDynamoDb)
  })

  it('should remove the table', async () => {
    let awsDynamoDb = await context.construct(AwsDynamoDB, {
      provider,
      tableName: 'test-table'
    })
    awsDynamoDb = await context.defineComponent(awsDynamoDb)
    awsDynamoDb = resolveComponentEvaluables(awsDynamoDb)
    await awsDynamoDb.deploy(null, context)

    const prevAwsDynamoDb = await deserialize(serialize(awsDynamoDb, context), context)
    await prevAwsDynamoDb.remove(context)

    expect(AWS.mocks.deleteTableMock).toBeCalledWith({ TableName: 'test-table' })
  })

  it('should remove the table even if it does not exist anymore', async () => {
    let awsDynamoDb = await context.construct(AwsDynamoDB, {
      provider,
      tableName: 'already-removed-table'
    })
    awsDynamoDb = await context.defineComponent(awsDynamoDb)
    awsDynamoDb = resolveComponentEvaluables(awsDynamoDb)
    await awsDynamoDb.deploy(null, context)

    const prevAwsDynamoDb = await deserialize(serialize(awsDynamoDb, context), context)
    await prevAwsDynamoDb.remove(context)

    expect(AWS.mocks.deleteTableMock).toBeCalledWith({ TableName: 'already-removed-table' })
  })

  it('shouldDeploy should return undefined when no changes have occurred', async () => {
    let awsDynamoDb = await context.construct(AwsDynamoDB, {
      provider,
      tableName: 'test-table'
    })
    awsDynamoDb = await context.defineComponent(awsDynamoDb)
    awsDynamoDb = resolveComponentEvaluables(awsDynamoDb)
    await awsDynamoDb.deploy(null, context)

    const prevAwsDynamoDb = await deserialize(serialize(awsDynamoDb, context), context)

    let nextAwsDynamoDb = await context.construct(AwsDynamoDB, {
      provider: await context.construct(AwsProvider, {}),
      tableName: 'test-table'
    })
    nextAwsDynamoDb = await context.defineComponent(nextAwsDynamoDb, prevAwsDynamoDb)
    nextAwsDynamoDb = resolveComponentEvaluables(awsDynamoDb)

    const result = nextAwsDynamoDb.shouldDeploy(prevAwsDynamoDb, context)

    expect(result).toBe(undefined)
  })

  it('shouldDeploy should returns "replace" when table name has changed', async () => {
    let awsDynamoDb = await context.construct(AwsDynamoDB, {
      provider,
      tableName: 'test-table'
    })
    awsDynamoDb = await context.defineComponent(awsDynamoDb)
    awsDynamoDb = resolveComponentEvaluables(awsDynamoDb)
    await awsDynamoDb.deploy(null, context)

    const prevAwsDynamoDb = await deserialize(serialize(awsDynamoDb, context), context)

    let nextAwsDynamoDb = await context.construct(AwsDynamoDB, {
      provider: await context.construct(AwsProvider, {}),
      tableName: 'updated-test-table'
    })
    nextAwsDynamoDb = await context.defineComponent(nextAwsDynamoDb, prevAwsDynamoDb)
    nextAwsDynamoDb = resolveComponentEvaluables(nextAwsDynamoDb)

    const result = nextAwsDynamoDb.shouldDeploy(prevAwsDynamoDb, context)

    expect(result).toBe('replace')
  })
})
