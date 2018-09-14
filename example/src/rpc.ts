/**
 * JSON RPC Client
 */
import RPC from '@gdjiami/jsonrpc'
import history from '@src/history'

const root = process.env.JM_RPC_ROOT || '/jsonrpc'
const rpc = new RPC(root, async (request, xhr, next) => {
  const res = await next(request)

  if (res.error && res.error.code === 401) {
    history.push('/401')
  }

  return res
})

export default rpc
