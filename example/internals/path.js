/**
 * 定义常用路径
 */
const path = require('path').posix

const root = path.resolve(__dirname, '../')
const context = path.join(root, 'src')
const static = path.join(root, 'public')
const dist = path.join(root, 'dist')

module.exports = {
  // 项目根目录
  root,
  // 源码根目录, webpack context
  context,
  // 静态目录，将直接拷贝到dist目录
  static,
  // 编译输出目录
  dist,
  // 模板扩展名
  pageExt: '.pug',
}