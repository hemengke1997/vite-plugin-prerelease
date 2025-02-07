function App() {
  return (
    <div className={'text-white'}>
      <h1>this is vite-plugin-prerelease playground</h1>
      <div>VITE_ENV: {import.meta.env.VITE_ENV}</div>
      <div>PRERELEASE: {JSON.stringify(import.meta.env.PRERELEASE)}</div>
    </div>
  )
}

export default App
