const fs = require('fs')
const path = require('path')
const paths = require('./path')
const pkg = require(path.join(paths.root, 'package.json'))

const BUILIN_ENVS = [
  'SOURCE_MAP',
  'USE_PREACT',
  'PORT',
  'HTTPS',
  'IGNORE_ENTRIES',
]

module.exports = function getEnvironment(env) {
  const NODE_ENV = env
  const dotenv = path.resolve(paths.root, '.env')
  var dotenvFiles = [
    `${dotenv}.${NODE_ENV}.local`,
    `${dotenv}.${NODE_ENV}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    NODE_ENV !== 'test' && `${dotenv}.local`,
    dotenv,
  ].filter(Boolean)

  dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
      require('dotenv').config({
        path: dotenvFile,
      })
    }
  })

  const ALLOWED_ENVS = [...(pkg.allowedEnvs || []), ...BUILIN_ENVS]
  const raw = Object.keys(process.env)
    .filter(key => key.startsWith('JM_') || ALLOWED_ENVS.indexOf(key) !== -1)
    .reduce(
      (env, key) => {
        env[key] = process.env[key]
        return env
      }, {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV,
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: NODE_ENV === 'production' ? process.env.PUBLIC_URL || '/' : '/',
        VERSION: process.env.VERSION || pkg.version,
      },
    )
  // Stringify all values so we can feed into Webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key])
      return env
    }, {}),
  }

  return {
    raw,
    stringified
  }
}