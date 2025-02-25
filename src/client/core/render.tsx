import { reactdomRender } from './dom/react-render'
import { Prelease_Widget_Id } from '.'
import Context, { type ContextType } from './context'
import { PrereleaseWidget } from './prerelease'

export function render({
  target,
  ...coreOptions
}: {
  target: HTMLElement
} & ContextType) {
  const container = document.createElement('div')
  container.id = Prelease_Widget_Id
  target.appendChild(container)

  reactdomRender(
    <Context.Provider value={coreOptions}>
      <PrereleaseWidget />
    </Context.Provider>,
    {
      container,
      sync: true,
    },
  )
}
