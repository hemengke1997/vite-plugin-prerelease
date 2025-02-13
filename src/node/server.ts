import cookie from 'cookie'

export function server(args: { cookie: string | undefined | null }) {
  const cookies = cookie.parse(args.cookie ?? '')
  global.__isPrerelease__ = cookies.prerelease === 'true'
}
