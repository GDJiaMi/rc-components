# 多页应用模板

## 配置

项目使用`.env`模式配置, 在 clone 项目后，将`.env.production.local.sample`重命名为`.env.development.local`和
`.env.production.local`, 分别表示开发环境和生成环境配置选项

内置配置选项

* SOURCE_MAP 是否输出 source_map, 默认为 true
* USE_PREACT 是否使用 preact，目前存在一些兼容问题，不建议使用, 默认为 false
* PORT 指定开发服务器端口，默认为 8080
* HTTPS 开发服务器是否启用 HTTPS, 默认为 false
* VERSION 指定版本号, 默认为 package.json 的 version 字段
* PUBLIC_URL 指定 webpack 的 PUBLIC_PATH
* IGNORE_ENTRIES 忽略的入口文件。默认情况下会扫描src下的*.pug和对应的*.tsx文件，使用配置指定多个glob模式，可以忽略入口文件
  从而提高构建效率. 多个模式使用','分割. 例如

  ```shell
  # 忽略a.pug, 和b.pug入口
  IGNORE_ENTRIES=**/a.pug,**/b.pug
  ```

自定义选项

如果程序中要使用到自定义字段，可以`JM_`为前缀命名。也可以将环境变量白名单追加到 package.json 的`allowedEnvs`数组中

## 代理

需要依赖 session 鉴权的开发的 web 应用，可以使用代理模式，代理配置文件为项目根目录下的`proxy.json`.

例如:

```json
{
  "/eim": {
    "target": "http://192.168.76.142:9090",
    "changeOrigin": true,
    "secure": false
  },
  "/jsonrpc": {
    "target": "http://192.168.76.142:9090",
    "changeOrigin": true,
    "secure": false
  }
}
```

和.env 文件一样，proxy.json 文件不应该提交到版本库中，因为他在每个开发者的开发环境可能都不一样。它们经常变动，所以建议为他们创建 sample 文件。后面的开发者在拷贝这些文件定义自己的配置

## 初始化项目

```
yarn
yarn initial
```