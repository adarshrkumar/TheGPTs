var roles = [
  'ai', 
  'error', 
  'box'
]

var p
var v
var chatElement
var voiceElement
var queryString
var urlParams
var interval

window.addEventListener('DOMContentLoaded', function (e) {
  queryString = window.location.search;
  urlParams = new URLSearchParams(queryString);

  p = urlParams.get('prompt')
  v = urlParams.get('voice')

  chatElement = document.querySelector('.input-parent .input')
  chatElement.focus()
  chatElement.addEventListener('keyup', function(e) {
    p = chatElement.value
    if (e.keyCode === 13 && chatElement.value !== '') {
      sendMessage(p, v)
    }
  })

  voiceElement = chatElement.parentNode.getElementById('voice')
  voiceElement.addEventListener('change', function(e) {
    v = voiceElement.value.toLowerCase()
  })

  chatElement.parentNode.querySelector('.send-btn').addEventListener('click', function(e) {
    var prompt = `${chatElement.value}. ${name}`
    if (prompt.includes('  ')) prompt = prompt.split('  ').join(' ')
    sendMessage(p, v)
  })

  function sendMessage(prompt, voice) {
    chatElement.value = prompt
    chatElement.value = ''
    newRequest('generate-audio', prompt, voice)
  }
});

function newRequest(type, prompt, voice, messageType, moreParams) {
  var reqUrl = `/sendRequest?p=${prompt}&v=${voice}&t=${type}`
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', reqUrl);
  xhr.addEventListener('load', function () {
    var response = this.responseText;
    var role = 'ai'

    var audio = document.querySelector('.generation')
    if (!!audio) {
      var playing = !!(
        audio.currentTime > 0 && 
        !audio.paused && 
        !audio.ended && 
        audio.readyState > 2
      );
      if (playing) {
        interval = setInterval(function() {
          if (audio.ended) {
            clearInterval(interval)
            messageActs()
          }
        }, 1000)
      }
    }
    else {
      messageActs()
    }

    function messageActs() {
      if (messageType === 'box') {
        newMessage(messageType, response, moreParams)
      }
      else {
        newMessage(role, response)
      }
    }
    
  });
  xhr.send();
}

function newMessage(role, src, moreParams) {
  var eleName = 'video'
  if (role === 'box') {
    eleName = 'div'
  }
  var message = document.querySelector('.generation');
  var hasMessage = !!message
  if (!hasMessage) {
    message = document.createElement(eleName);
    message.classList.add('generation');
  }
  roles.forEach(function(r) {
    message.classList.remove(r)
  })
  message.classList.add(role)
  if (role === 'box') {
    message.textContent = src
    variation = moreParams.variation
    if (!!variation === false) variation = 'info'
    message.classList.add(variation)
  }
  else {
    message.src = src
    if (!hasMessage) message.controls = 'true'
  }

  document.querySelector('.generation-area').appendChild(message)
  if (role !== 'box') message.play()
}