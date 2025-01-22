export interface PrereleaseWidgetOptions {
  /**
   * 挂载DOM
   * @default document.body
   */
  target?: string | HTMLElement

  /**
   * 按钮悬浮
   * @description false 则关闭悬浮
   * @default
   * ```js
   * { offsetX: 8 }
   * ```
   */
  float?:
    | {
        offsetX?: number
      }
    | false

  /**
   * 按钮默认位置
   * @default
   * ```js
   * { x: 0, y: 0 }
   * ```
   */
  defaultPosition?: {
    x?: number
    y?: number
  }

  /**
   * 预发布/非预发布组件文本
   */
  text?: {
    /**
     * 预发布文本
     */
    prerelease?: string
    /**
     * 非预发布文本
     */
    nonPrerelease?: string
  }

  /**
   * 小组件就绪时回调
   */
  onReady?: () => void
}

export type Position = {
  x: number
  y: number
}
