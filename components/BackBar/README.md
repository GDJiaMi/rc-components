# BackBar

配置

```typescript
// components/BackBar.tsx
import history from 'myHistory'
import createBackBar from '@gdjiami/rc-components/lib/BackBar'
import '@gdjiami/rc-components/lib/BackBar/style/css'

export createBackBar({history})
```

使用

```typescript
import BackBar from 'components/BackBar'

// 使用
<BackBar title="mytitle" after={<span>其他</span>} />
```
