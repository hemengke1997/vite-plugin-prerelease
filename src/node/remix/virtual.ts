export const runtimeId = 'virtual:prerelease-runtime'

export const serverId = 'virtual:prerelease-server'

export const vmods = [runtimeId, serverId]

export const resolvedVirtualModuleId = (virtualModuleId: string) => `\0${virtualModuleId}`
