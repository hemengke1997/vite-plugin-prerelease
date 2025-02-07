export const runtimeId = 'virtual:prerelease-runtime'

export const vmods = [runtimeId]

export const resolvedVirtualModuleId = (virtualModuleId: string) => `\0${virtualModuleId}`
