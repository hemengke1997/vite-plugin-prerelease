import { clientApi } from '../api'
import Context from './context'
import Draggable from './draggable'

export function PrereleaseWidget() {
  const { text } = Context.usePicker(['text'])

  return (
    <>
      <div className='pw-block pw-fixed pw-z-[99999] pw-right-0 pw-top-0 pw-left-0 pw-bottom-0 pw-pointer-events-none'>
        <Draggable>
          <div
            className='pw-overflow-hidden pw-bg-black pw-bg-opacity-80 pw-text-white pw-p-1 pw-text-xs pw-cursor-pointer pw-backdrop-blur-md pw-select-none pw-shadow-md pw-rounded-md'
            onClick={() => {
              clientApi.tooglePrerelease()
            }}
          >
            {clientApi.isPrerelease ? text?.prerelease : text?.nonPrerelease}
          </div>
        </Draggable>
      </div>
    </>
  )
}
