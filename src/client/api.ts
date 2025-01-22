class ClientApi {
  get isPrerelease() {
    return window.Cookies?.get('prerelease') === 'true'
  }
  enablePrerelease() {
    window.Cookies?.set('prerelease', 'true', {
      expires: 1,
    })
  }
  disablePrelease() {
    window.Cookies?.remove('prerelease')
  }
  tooglePrerelease() {
    if (this.isPrerelease) {
      this.disablePrelease()
    } else {
      this.enablePrerelease()
    }
    window.location.reload()
  }
}

const clientApi = new ClientApi()

export { clientApi }
