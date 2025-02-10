import { clientApi } from '../api'
import Context from './context'
import Draggable from './draggable'

export function PrereleaseWidget() {
  const { text } = Context.usePicker(['text'])

  return (
    <>
      <div className='pw-pointer-events-none pw-fixed pw-bottom-0 pw-left-0 pw-right-0 pw-top-0 pw-z-[99999] pw-block'>
        <Draggable>
          <div
            className='pw-cursor-pointer pw-select-none pw-overflow-hidden pw-rounded-md pw-bg-black pw-bg-opacity-80 pw-p-1 pw-text-[12px] pw-text-white pw-shadow-md pw-backdrop-blur-md'
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
