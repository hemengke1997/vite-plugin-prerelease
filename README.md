# vite-plugin-prerelease

## 介绍

预发布插件。插件会在网页上植入小组件，用于切换测试/预发布环境

默认预发布环境取的 `production` 环境变量，你可以在代码中通过 `import.meta.env.PRERELEASE` 来判断是否是预发布环境

此插件解决了需要新建预发布git分支、切换分支、合并代码等繁琐操作

## 使用方式

此插件使用非常简单，通常情况下，只需要引入插件即可，无需额外配置

```ts
import { defineConfig } from 'vite'
import { prerelease } from 'vite-plugin-prerelease'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      prerelease(),
    ]
  }
})
```

就这么简单！启动项目看到左上角小组件，点击即可切换环境！

```bash
NODE_ENV=test vite build --mode test
```

## import.meta.env

插件会在 `import.meta.env` 上注入 `PRERELEASE` 变量，用于判断是否是预发布环境

### 使用方式

```ts
console.log(import.meta.env.PRERELEASE)
```

## 小组件

用于在网页上获取和控制环境。

网页小组件已经提供了切换环境的能力了，如果不满足需求，可以使用此 API 进行自定义

### 使用方式

```ts
import { clientApi } from 'vite-plugin-prerelease/client'
```

#### isPrerelease

- 类型: `boolean`

是否是预发布环境

#### enablePrerelease

- 类型: `() => void`

切换至预发布环境

#### disablePrelease

- 类型: `() => void`

切换至测试环境

#### tooglePrerelease

- 类型: `() => void`

切换环境

## 配置项

以下是进阶配置，通常你不需要任何配置

### mode

- 类型: `string`
- 默认值: `runtime`

插件目前支持两种模式，`runtime` 和 `buildtime`。`runtime` 模式下，插件会在运行时注入环境变量，`buildtime` 模式下，插件会在构建时生成预发布代码。

`runtime` 支持 CSR 和 SSR，`buildtime` 仅支持 CSR


### prereleaseEnv

- 类型: `string`
- 默认值: `production`

使用此环境，用于构建预发布环境代码

### excludeEnvs

- 类型: `string[]`
- 默认值: `[]`

需要排除的环境变量，排除之后，环境变量不再被动态修改

### entry

- 类型: `string`
- 默认值: `src/main`

项目入口文件，对于 `csr` 项目，入口通常是 `src/main`，对于 `remix/rr7` 项目，入口通常是 `app/root`

### prereleaseWidget

- 类型: `PrereleaseWidgetOptions`

网页小组件配置项，用于配置组件的位置、能否浮动等。


## Remix / React-Router 7 服务端渲染

你还需要做一些简单的操作：

在 `root` 中添加以下代码：
```tsx
import server from 'vite-plugin-prerelease/remix/server'

export function loader({ request }) {
  server({
    cookie: request.headers.get('Cookie'),
  })
  
  // Your code
}
```

这样就可以了！

## 注意事项

- 如果 NODE_ENV 是 `production`，则插件不会生效，避免了在生产环境下出现预发布代码
