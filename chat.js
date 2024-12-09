var replacements = [
  {
    key: '**', 
    value: 'b'
  }, 
  {
    key: '*', 
    value: 'i', 
  }, 
  {
    key: '__', 
    value: 'u', 
  }, 
  {
    key: '```', 
    value: 'pre', 
  }, 
  {
    key: '`', 
    value: 'code', 
  }
]


var startingPrompt
var notRun = true
var chatElement
var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var filelocation
var urls
var fnames
var fname = ''
var lastAnswer
var interval
var specialActs4Conv = function(x,y,z) {}

function sendMessage() {
  var prompt = chatElement.value
  if (prompt.endsWith('\n')) prompt = prompt.slice(0, -1)
  if (prompt.endsWith(' ')) prompt = prompt.slice(0, -1)
  if (!prompt.endsWith('.')) prompt += '.'
  prompt += ` ${fname}`
  if (prompt.includes('  ')) prompt = prompt.split('  ').join(' ')

  var newPrompt = prompt
  if (notRun) {
    newPrompt = `${newPrompt}<div class="chat-imgs">`
    urls.forEach(function(u, i) {
      newPrompt += `<img class="input-image" src="${u}" alt="Image #${i+1}">`
    })
    newPrompt += '</div>'
    notRun = false
  }
  newMessage('user', newPrompt)
  chatElement.value = ''
  newRequest('image', prompt, urls)
}

function sendWelcomeMessage() {
  newRequest('text', startingPrompt, null, 'box', {variation: 'info', name: 'welcome'})
}

window.addEventListener("DOMContentLoaded", function (e) {
  if (!!startingPrompt) sendWelcomeMessage()
  else {
    setTimeout(sendWelcomeMessage, 1000)
  }
  
  filelocation = urlParams.get('filelocation');

  fnames = urlParams.get('name');
  if (!!fnames) {
    if (fnames.includes(',')) fnames = fnames.split(',')
    else fnames = [fnames]
  }
  urls = urlParams.get('url');
  if (!!urls) {
    if (urls.includes(',')) urls = urls.split(',')
    else urls = [urls]
    urls.forEach(function(u, i) {
      urls[i] = urls = decodeURIComponent(u)
    })
  }
  else urls = []
  if (filelocation == 'temp-storage') {
    fname += ` The names of the files are [`
    fnames.forEach(function(n, i) {
      urls.push(`https://${location.hostname}/temp?name=${n}`)
      fname += `"${n}"`
      if (i !== 0) fname += `, `
    })
    fname += `].`
    if (fname.includes('  ')) fname = fname.split('  ').join(' ')
}

  var type = urlParams.get('type')
  if (!!lastAnswer !== false) {
    if (type === 'makeai') location.href = `https://ImaGPT.adarshrkumar.dev/create?prompt=${lastAnswer}`
  }
  else {
    setInterval(function() {
      if (!!lastAnswer !== false) {
        if (type === 'makeai') location.href = `https://ImaGPT.adarshrkumar.dev/create?prompt=${lastAnswer}`
      }
    }, 100)
  }
  
  chatElement = document.querySelector('.input-parent .input')
  chatElement.focus()
  chatElement.addEventListener('keyup', function(e) {
    if (e.keyCode === 13 && chatElement.value !== '') {
      sendMessage()
    }
  })

  chatElement.parentNode.querySelector('.send-btn').addEventListener('click', function(e) {
    sendMessage()
  })
});

function newRequest(type, prompt, urls, messageType, moreParams) {
  if (!!urls) {
    urls.forEach(function(u, i) {
      urls[i] = encodeURIComponent(u)
    })
    if (urls.length > 1) urls = urls.join(',')
  }
  var reqUrl = `/sendRequest?p=${prompt}&t=${type}`
  if (!!app) reqUrl += `&a=${app}`
  if (type == 'image') reqUrl += `&urls=${urls}`
  
  var xhr = new XMLHttpRequest();
  xhr.open("GET", reqUrl);
  xhr.addEventListener("load", function () {
    var response = this.responseText;
    var output;
    var role = 'ai'
    if (response.startsWith('{') || response.startsWith('[')) {
      response = JSON.parse(response)
      if (response['error']) {
        var error = response['error']
        output = error['message']
        role = 'error'
      }
      else {
        choices = response['choices']
        choices.forEach(function(choice) {
          finish_reason = choice['finish_reason']
          if (finish_reason == 'stop') {
            message = choice['message']
            output = message['content']
          }
        })
      }
    }
    if (type === 'create-image') output = `<img src="${output}" alt="Generated Image">` 
    lastAnswer = output
    if (messageType === 'box') {
      newMessage(messageType, output, moreParams)
    }
    else {
      newMessage(role, output)
    }
  });
  xhr.send();
}

function newMessage(role, content, moreParams) {
  var message = document.createElement("div");
  message.classList.add(role);
  if (role === 'box') {
    variation = moreParams.variation
    if (!!variation === false) variation = 'info'
    message.classList.add(variation)
  }
  message.classList.add("message");

  if (role !== "error" && role !== 'box') {
    let image = document.createElement("div");
    image.classList.add("image");
    message.appendChild(image);
  }

  var text = document.createElement("span");
  text.classList.add("text");

  let textSpan = document.createElement("span");
  textSpan.classList.add("text__span");
  text.appendChild(textSpan);

  message.appendChild(text);

  document.querySelector('.messages').appendChild(message)

  var staggerRoles = [
    'ai', 
    'error', 
    'box', 
  ]

  var isRole = false
  staggerRoles.forEach(function(r) {
    if (role === r) isRole = true
  })
  if (isRole) {
    var sI = 0;
    var prevContent = ''
    if (!!content) {
      interval = setInterval(doActs, 50);
      doActs();
    }
    else {
      textSpan.innerHTML = 'Unknown Error'
      setScrollPos()
    }
    function doActs() {
      if (sI < content.length) {
        let currLett = content.split('')[sI];
        prevContent += currLett;
        replacements.forEach(function(r, i) {
          if (prevContent.includes(r.key)) {
            if (prevContent.split(r.key).length % 2 !== 0) {
              prevContent = prevContent.replace(r.key, `<${r.value}>`)
              prevContent = prevContent.replace(r.key, `</${r.value}>`)
            }
          }
        })
        textSpan.innerHTML = prevContent
        sI++;
      } 
      else {
        clearInterval(interval);
      }
      setScrollPos()
    }
  } 
  else {
    var theContent = content
    replacements.forEach(function(r, i) {
      if (theContent.includes(r.key)) {
        if (theContent.split(r.key).length % 2 !== 0) {
          theContent = theContent.replace(r.key, `<${r.value}>`)
          theContent = theContent.replace(r.key, `</${r.value}>`)
        }
      }
    })
    textSpan.innerHTML = theContent
    setScrollPos()
  }
}
function setScrollPos() {
  var element = document.querySelector('.messages');
  element.scrollTop = element.scrollHeight;
}