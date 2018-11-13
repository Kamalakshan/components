import { resolve } from '@serverless/utils'
import path from 'path'
import { createContext } from '../../../src/utils'

const createTestContext = async () =>
  createContext(
    {
      cwd: path.join(__dirname, '..'),
      overrides: {
        debug: () => {},
        log: () => {}
      }
    },
    {
      app: {
        id: 'test'
      }
    }
  )

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('Service', () => {
  it('should default components and functions to empty objects', async () => {
    const context = await createTestContext()
    const Service = await context.loadType('Service')
    const service = await context.construct(Service, {})

    expect(resolve(service.components)).toEqual({})
    expect(resolve(service.functions)).toEqual({})
  })

  it('should construct function instances when construct is called', async () => {
    const context = await createTestContext()
    const Service = await context.loadType('Service')
    const Function = await context.loadType('Function')

    const service = await context.construct(Service, {
      functions: {
        hello: {
          functionName: 'hello'
        }
      }
    })

    expect(service.functions.hello).toBeInstanceOf(Function.class)
    expect(resolve(service.functions.hello.functionName)).toBe('hello')
  })

  it('should construct component instances when construct is called', async () => {
    const context = await createTestContext()
    const Service = await context.loadType('Service')
    const Component = await context.loadType('Component')

    const service = await context.construct(Service, {
      components: {
        hello: {}
      }
    })

    expect(service.components.hello).toBeInstanceOf(Component.class)
  })

  it('should define functions as instances', async () => {
    const context = await createTestContext()
    const Service = await context.loadType('Service')
    const Fn = await context.loadType('Function')

    const service = await context.construct(Service, {
      functions: {
        hello: {
          functionName: 'hello'
        }
      }
    })

    const children = await service.define(context)
    expect(children).toMatchObject({
      hello: expect.any(Fn.class)
    })
  })

  it('should return the service info when info is called', async () => {
    const context = await createTestContext()
    const Service = await context.loadType('Service')

    const service = await context.construct(Service, {
      functions: {
        hello: {
          functionName: 'hello'
        }
      },
      components: {
        myComponent: {}
      }
    })

    const info = await service.info()
    expect(info.title).toEqual('Service')
    expect(info.type).toEqual('Service')
    expect(info.data).toEqual({})
    const children = info.children.sort((first, second) => first.type.localeCompare(second.type))
    expect(children).toHaveLength(2)
    expect(children[0].type).toEqual('Component')
    expect(children[1].type).toEqual('Function')
  })
})
