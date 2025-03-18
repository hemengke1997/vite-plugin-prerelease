import { merge } from 'es-toolkit'
import { isObject } from 'es-toolkit/compat'
import { type ContextType } from './context'
import { render } from './render'
import { type PrereleaseWidgetOptions } from './types'
import { $ } from './utils/query'
import './index.css'

export const Prelease_Widget_Id = '__prerelease_widget'

export class PrereleaseWidget {
  public isInited: boolean = false

  public option: ContextType = {
    target: 'body',
    float: {
      offsetX: 8,
    },
    defaultPosition: {
      x: 0,
      y: 0,
    },
    text: {
      prerelease: '预发布',
      nonPrerelease: '测试',
    },
  }

  constructor(opts: PrereleaseWidgetOptions = {}) {
    this.isInited = false

    if (isObject(opts)) {
      this.option = merge(this.option, opts)
    }

    // try to init
    const _onload = () => {
      if (this.isInited) {
        return
      }
      this._initComponent()
      this._autoRun()
    }

    if (document !== undefined) {
      if (document.readyState === 'loading') {
        $.bind(window, 'DOMContentLoaded', _onload)
      } else {
        _onload()
      }
    } else {
      let _timer: number
      const _pollingDocument = () => {
        if (!!document && document.readyState === 'complete') {
          _timer && clearTimeout(_timer)
          _onload()
        } else {
          _timer = window.setTimeout(_pollingDocument, 1)
        }
      }
      _timer = window.setTimeout(_pollingDocument, 1)
    }
  }

  private _autoRun() {
    this.isInited = true

    this.option.onReady?.()
  }

  private _initComponent() {
    if (!$.one(`#${Prelease_Widget_Id}`)) {
      let target: HTMLElement = document.body
      if (typeof this.option.target === 'string') {
        target = document.querySelector(this.option.target)!
      } else if (this.option.target instanceof HTMLElement) {
        target = this.option.target
      }
      if (!(target instanceof HTMLElement)) {
        target = document.body
      }

      render({
        target,
        defaultPosition: {
          x: this.option.defaultPosition!.x,
          y: this.option.defaultPosition!.y,
        },
        float: this.option.float,
        text: this.option.text,
      })
    }
  }
}
