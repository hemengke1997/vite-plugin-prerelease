export function Welcome() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-16'>
        <div>VITE_ENV: {import.meta.env.VITE_ENV}</div>
        <div>PRERELEASE: {JSON.stringify(import.meta.env.PRERELEASE)}</div>
      </div>
    </div>
  )
}
