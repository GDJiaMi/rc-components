/**
 * 菜单定义
 */
export default [
  [
    '*',
    {
      path: '/',
      title: '首页',
      icon: 'appstore-o',
    },
    {
      path: '/user-select',
      title: '用户选择器',
      icon: 'appstore-o',
    },
    {
      path: '/error-page',
      title: '通用错误页面',
      icon: 'appstore-o',
    },
    {
      path: '/fat-modal',
      title: '富模态框组件',
      icon: 'appstore-o',
    },
    {
      path: '/fat-table',
      title: '富表格组件',
      icon: 'appstore-o',
      children: [
        {
          path: '/fat-table/base',
          title: '基本使用',
        },
        {
          path: '/fat-table/custom-layout',
          title: '自定义布局',
        },
        {
          path: '/fat-table/operation',
          title: '常用操作',
        },
      ],
    },
    {
      path: '/footer-toolbar',
      title: '表单扩展',
      icon: 'appstore-o',
    },
    {
      path: '/split',
      title: '可拖动分割组件',
      icon: 'appstore-o',
    },
    {
      path: '/ellipsis',
      title: '多行省略',
      icon: 'appstore-o',
    },
    {
      path: '/acl',
      title: '访问控制',
      icon: 'appstore-o',
    },
  ],
  [
    'create',
    {
      path: '/create',
      title: '具有create权限',
      icon: 'appstore-o',
    },
  ],
  [
    'view',
    {
      path: '/view',
      title: '具有view权限',
      icon: 'appstore-o',
    },
  ],
]
