import { type PropsWithChildren, useEffect, useRef } from 'react'
import { useDraggable } from '@neodrag/react'
import { useLocalStorageState, useMemoizedFn } from 'ahooks'
import { max } from 'lodash-es'
import { classNames } from 'tw-clsx'
import { Prelease_Widget_Id } from '.'
import Context from './context'
import { type Position } from './types'

type DraggableProps = PropsWithChildren
const IOS_SAFE_AREA = 20

const bounds = {
  top: 0,
  left: 0,
  right: 0,
  bottom: IOS_SAFE_AREA,
}

function Draggable(props: DraggableProps) {
  const { children } = props

  const { defaultPosition, float } = Context.usePicker(['defaultPosition', 'float'])

  const draggableRef = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useLocalStorageState(`${Prelease_Widget_Id}_position`, {
    defaultValue: {
      x: defaultPosition?.x || 0,
      y: defaultPosition?.y || 0,
    },
  })

  const { isDragging } = useDraggable(draggableRef, {
    position,
    defaultPosition: position,
    legacyTranslate: true,
    gpuAcceleration: true,
    onDrag: (data) => {
      const { offsetX, offsetY } = data
      setPosition({ x: offsetX, y: offsetY })
    },
    onDragEnd(data) {
      const { offsetX, offsetY } = data
      setPosition(fixFloatPosition({ x: offsetX, y: offsetY }))
    },
    axis: 'both',
    bounds,
  })

  const getDocSize = useMemoizedFn(() => {
    const docWidth = max([document.documentElement.offsetWidth, window.innerWidth])!
    const docHeight = max([document.documentElement.offsetHeight, window.innerHeight])!
    return {
      docWidth,
      docHeight,
    }
  })

  const fixFloatPosition = useMemoizedFn((position: Position) => {
    if (float) {
      float.offsetX ??= 0
      const { x, y } = position
      const { docWidth } = getDocSize()
      const w = draggableRef.current!.getBoundingClientRect().width
      let newX = docWidth && x + w / 2 > docWidth / 2 ? docWidth - w - float.offsetX : float.offsetX
      newX = max([newX, float.offsetX])!
      const newY = max([y, bounds.top])!
      return { x: newX, y: newY }
    }
    return position
  })

  const getButtonSafeAreaXY = (x: number, y: number) => {
    const { docWidth, docHeight } = getDocSize()

    const btn = draggableRef.current!
    if (x + btn.offsetWidth > docWidth) {
      x = docWidth - btn.offsetWidth
    }

    if (y + btn.offsetHeight > docHeight) {
      y = docHeight - btn.offsetHeight
    }

    if (x < 0) {
      x = max([defaultPosition?.x, bounds.left])!
    }

    if (y >= docHeight - btn.offsetHeight) {
      y = docHeight - btn.offsetHeight - bounds.bottom
    }

    if (y < 0) {
      y = max([defaultPosition?.y, bounds.top])!
    }

    return [x, y]
  }

  useEffect(() => {
    if (draggableRef.current) {
      const [x, y] = getButtonSafeAreaXY(position!.x, position!.y)
      setPosition(fixFloatPosition({ x, y }))
    }
  }, [draggableRef.current])

  return (
    <div
      ref={draggableRef}
      className={classNames('pw-pointer-events-auto pw-w-fit', !isDragging && 'pw-transition-transform')}
    >
      {children}
    </div>
  )
}

export default Draggable
