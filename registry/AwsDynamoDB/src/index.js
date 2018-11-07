import { get, or, pick, resolvable, equals, not } from '@serverless/utils'
import { createTable, deleteTable } from './utils'

const AwsDynamoDB = (SuperClass) =>
  class extends SuperClass {
    async construct(inputs, context) {
      await super.construct(inputs, context)

      this.tableName = resolvable(() => or(inputs.tableName, `table-${this.instanceId}`))
      this.provider = resolvable(() => or(inputs.provider, context.get('provider')))
    }

    shouldDeploy(prevInstance) {
      if (!prevInstance) {
        return 'deploy'
      }

      if (
        prevInstance.tableName !== this.tableName ||
        not(equals(prevInstance.attributeDefinitions, this.attributeDefinitions)) ||
        not(equals(prevInstance.keySchema, this.keySchema)) ||
        not(equals(prevInstance.provisionedThroughput, this.provisionedThroughput)) ||
        not(equals(prevInstance.globalSecondaryIndexes, this.globalSecondaryIndexes)) ||
        not(equals(prevInstance.localSecondaryIndexes, this.localSecondaryIndexes)) ||
        not(equals(prevInstance.sseSpecification, this.sseSpecification)) ||
        not(equals(prevInstance.streamSpecification, this.streamSpecification))
      ) {
        return 'replace'
      }
    }

    async deploy(prevInstance, context) {
      const tableName = get('tableName', this)

      context.log(`Creating table: '${tableName}'`)
      await createTable(this)
      context.log(`Table created: '${tableName}'`)
    }

    async remove(context) {
      context.log(`Removing table: '${this.tableName}'`)
      await deleteTable(this)
    }

    async info() {
      return {
        title: this.name,
        type: this.name,
        data: pick(['name', 'license', 'version', 'tableName'], this)
      }
    }
  }

export default AwsDynamoDB
