import { type ComponentType, useEffect, useState } from 'react'
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

export const withPrereleaseWidget = (Component: ComponentType, config: PrereleaseWidgetOptions) => () => {
  function AppWithPrereleaseWidget(props: any) {
    const hydrated = useHydrated()
    useEffect(() => {
      if (hydrated) {
        // prerelease widget
        setTimeout(() => {
          new PrereleaseWidget(config)
        })
      }
    }, [hydrated])

    return <Component {...props} />
  }
  return AppWithPrereleaseWidget
}
