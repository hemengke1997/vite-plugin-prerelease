import { type ComponentType, useEffect, useState } from 'react'
// @ts-ignore
import { PrereleaseWidget, type PrereleaseWidgetOptions } from 'vite-plugin-prerelease/client'

let hydrating = true

function useHydrated() {
  const [hydrated, setHydrated] = useState(() => !hydrating)

  useEffect(() => {
    hydrating = false
    setHydrated(true)
  }, [])

  return hydrated
}

function injectScript(content: string) {
  const script = document.createElement('script')
  script.innerHTML = content
  document.body.appendChild(script)
}

export const withPrereleaseWidget =
  (
    Component: ComponentType,
    config: PrereleaseWidgetOptions,
    runtimeCode: {
      jsCookie: string
      env: string
    },
  ) =>
  () => {
    function AppWithPrereleaseWidget(props: any) {
      const hydrated = useHydrated()
      const [key, setKey] = useState(0)
      useEffect(() => {
        if (hydrated) {
          // js-cookie
          injectScript(runtimeCode.jsCookie)

          // runtime env
          injectScript(runtimeCode.env)

          setKey((t) => t + 1)

          // prerelease widget
          setTimeout(() => {
            new PrereleaseWidget(config)
          })
        }
      }, [hydrated])
      return <Component {...props} key={key} />
    }
    return AppWithPrereleaseWidget
  }
