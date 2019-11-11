let cache = {}

const RULE_REGEXP = /^(\d+)(\((([\-\>\<]\d+,){0,2}([\-\>\<]\d+))\))?$/
/**
 * # 多个屏幕断点
 * xs:xxx
 * sm:xxx
 * md:xxx
 *
 * # 单个断点, 默认是xs, 使用|分割label和wrapper
 * 1|3 -> {labelCol: {xs: {span: 1}}, wrapperCol: {xs: {span: 3}}}
 *
 * offset,pull,push
 * 1(-2,<3,>4)|3 -> {labelCol: {xs: {span: 1, offset: 3, pull: 3, push: 4}}}
 */
function gen(desc: string) {
  if (desc in cache) {
    return cache[desc]
  }

  const rules = desc.split('\n').map(i => {
    const line = i.trim()
    const breakpoint = line.split(':')
    const normalizedBreakpoint =
      breakpoint.length === 1 ? ['xs', breakpoint[0]] : breakpoint
    const sections = normalizedBreakpoint[1].split('|').map(desc => {
      const matched = desc.match(RULE_REGEXP)
      if (matched == null) {
        throw new Error('useFormLayout格式错误')
      }

      const span = parseInt(matched[1], 10)
      const offsets = matched[3]
      let offset: number | undefined
      let push: number | undefined
      let pull: number | undefined

      if (offsets) {
        offsets.split(',').forEach(i => {
          const matched = i.match(/^([\-\<\>])(\d+)$/)
          if (matched == null) {
            throw new Error('useFormLayout格式错误')
          }

          const num = parseInt(matched[2])
          switch (matched[1]) {
            case '-':
              offset = num
              break
            case '<':
              pull = num
              break
            case '>':
              push = num
              break
            default:
          }
        })
      }

      return {
        span,
        offset,
        push,
        pull,
      }
    })

    return {
      breakpoint: normalizedBreakpoint[0],
      labelCol: sections[0],
      wrapperCol: sections[1],
    }
  })

  return (cache[desc] = rules.reduce<{ labelCol: any; wrapperCol: any }>(
    (prev, cur) => {
      prev.labelCol[cur.breakpoint] = cur.labelCol
      prev.wrapperCol[cur.breakpoint] = cur.wrapperCol
      return prev
    },
    { wrapperCol: {}, labelCol: {} },
  ))
}

/**
 * 生成 antd 表单排版对象
 * @param desc 形式化的字符串
 */
export default function useFormLayout(desc: string) {
  return gen(desc)
}
