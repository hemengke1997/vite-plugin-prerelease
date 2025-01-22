import { createContainer } from 'context-state'
import { type PrereleaseWidgetOptions } from './types'

type ExcludedKeys = 'target' | 'onReady'
type RequiredOptions = Required<Omit<PrereleaseWidgetOptions, ExcludedKeys>>
type OptionalOptions = Pick<PrereleaseWidgetOptions, ExcludedKeys>

export type ContextType = RequiredOptions & OptionalOptions

function useContext(initialValues: ContextType) {
  return initialValues
}

const Context = createContainer(useContext)

export default Context
