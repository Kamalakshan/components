const fs = require('./fs')
const log = require('./log')
const getRegistryRoot = require('./getRegistryRoot')
const state = require('./state')
const telemetry = require('./telemetry')
const analytics = require('./analytics')
const config = require('./config')
const components = require('./components')
const dag = require('./dag')
const variables = require('./variables')

module.exports = {
  ...fs,
  ...state,
  ...telemetry,
  ...analytics,
  ...config,
  ...variables,
  ...components,
  ...dag,
  log,
  getRegistryRoot
}
