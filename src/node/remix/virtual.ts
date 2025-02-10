export const id = (name: string) => `virtual:prerelease-${name}`

export const runtimeId = id('runtime')

export const serverId = id('server')

export const vmods = [runtimeId, serverId]

export const resolvedVirtualModuleId = (virtualModuleId: string) => `\0${virtualModuleId}`
