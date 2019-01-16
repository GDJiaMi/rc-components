module.exports = {
  src: './',
  files: '**/*.{md,markdown,mdx}',
  title: 'rc-components',
  description: 'MYGZB.com 中后台业务组件',
  port: 3000,
  typescript: true,
  ordering: 'ascending',
  hashRouter: true,
  modifyBundlerConfig: (config) => {
    const rule = config.module.rules[1]
    config.module.rules.unshift({
      test: /\.css$/,
      use: [
        require.resolve('style-loader'),
        require.resolve('css-loader'),
      ]
    })
    rule.use[1] = {
      loader: require.resolve('react-docgen-typescript-loader'),
      options: {
        tsconfigPath: 'tsconfig.json'
      }
    }
    return config
  }
}