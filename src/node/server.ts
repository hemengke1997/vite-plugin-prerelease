import cookie from 'cookie'

export function server(args: { cookie: string | undefined | null }) {
  const cookies = cookie.parse(args.cookie ?? '')
  // @ts-ignore
  global.__isPrerelease__ = cookies.prerelease === 'true'
}
