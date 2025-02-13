declare module 'virtual:prerelease-runtime' {
  const runtime: string
  export default runtime
}

declare module 'virtual:prerelease-widget' {
  const PrereleaseWidget: any
  export { PrereleaseWidget }
}
