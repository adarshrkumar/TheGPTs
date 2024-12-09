var photoBtn = document.querySelector('.photo')
var photoArea = document.querySelector('.photo-area')

photoBtn.onclick = function(e) {
  document.querySelector('.photo-area iframe').src = '/photo/take'
  if (photoArea.classList.contains('active')) {
    document.querySelector('.photo-area iframe').src = ''
  }
  photoArea.classList.toggle('active')
}

var form = document.querySelector('form')

var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)

var app = urlParams.get('app')
if (!!app) form.action = `${form.action}?a=${app}`

var prompt = urlParams.get('prompt')
if (!!prompt) form.action = `${form.action}?p=${prompt}`

var type = urlParams.get('type')
if (!!prompt) form.action = `${form.action}?t=${type}`

function removeActive() {
  photoArea.classList.remove('active')
  document.querySelector('.photo-area iframe').src = ''
}