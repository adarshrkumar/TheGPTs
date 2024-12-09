var app = new URLSearchParams(location.search).get('app')
document.title = app
var iconEle = document.querySelector('link[rel="icon"]')
if (iconEle) {
  if (iconEle.href.includes('TheGPTs')) {
    iconEle.href = iconEle.href.replace('TheGPTs', app)
  }
}

var script = document.createElement('script')
script.src = `/${app}.js`
document.body.prepend(script)
