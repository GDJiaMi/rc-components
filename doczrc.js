module.exports = {
  src: './components',
  title: 'rc-components',
  description: 'MYGZB.com 中后台业务组件',
  typescript: true,
  ordering: 'ascending',
  hashRouter: true,
  modifyBundlerConfig: (config) => {
    const rule = config.module.rules[1]
    rule.use[1] = {
      loader: require.resolve('react-docgen-typescript-loader'),
      options: {
        tsconfigPath: 'tsconfig.json'
      }
    }
    return config
  }
}