import { type ReactElement, startTransition } from 'react'
import { flushSync } from 'react-dom'
import ReactDOM, { type Root } from 'react-dom/client'

const MARK = '__prerelease_widget_root__'

type ContainerType = (Element | DocumentFragment) & {
  [MARK]?: Root
}

export function reactdomRender(
  node: ReactElement,
  {
    container,
    sync,
  }: {
    container: ContainerType
    sync?: boolean
  },
) {
  const render = () =>
    startTransition(() => {
      const root = container[MARK] || ReactDOM.createRoot(container)
      root.render(node)
      container[MARK] = root
    })

  if (sync) {
    Promise.resolve().then(() => flushSync(render))
  } else {
    render()
  }
}

export async function reactdomUnmount(container: ContainerType) {
  await Promise.resolve()
  container[MARK]?.unmount()
  delete container[MARK]
}
