declare module 'virtual:prerelease-runtime' {
  const runtime: string
  export default runtime
}

declare module 'virtual:prerelease-server' {
  const server: (request: Request) => void
  export default server
}
