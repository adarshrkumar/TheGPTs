var fs = require('fs');
var request = require('request'); 
var imageRequest = require('./image.js').default
var audioRequest = require('./audio.js').default

// OpenAI API Key
var api_key = process.env['OPENAI_API_KEY']

// Function to encode the image
function encode_image(image_path, type) {
  var image_file = image_path
  if (type !== 'url') {
    image_file  = fs.readFileSync(image_path, 'base64')
  }
  return image_file;
}

function newRequest(res, text_prompt, model, type, urls, size, voice) {
  switch(type) {
    case 'create-image': 
      imageRequest(res, text_prompt, model, size)
      break
    case 'generate-audio':
      audioRequest(res, text_prompt, voice, model)
  }
  if (type == 'create-image') {
    imageRequest(res, text_prompt, model)
    return
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${api_key}`
  }
  
  const pContent = [
    {
      "type": "text",
      "text": text_prompt
    },
  ]
  
  if (type == 'image' && !!urls) {
    urls.forEach(function(u) {
      pContent.push({
        "type": "image_url",
        "image_url": {
          "url": u
        }
      })
    })
  }
  
  const payload = {
    "model": `gpt-4-${model}`,
    "messages": [
      {
        "role": "user",
        "content": pContent
      }
    ],
    "max_tokens": 300
  }

  request.post(
    {
      headers: headers, 
      url: "https://api.openai.com/v1/chat/completions", 
      body: JSON.stringify(payload), 
    }, 
    function(error, result, body) {
      body = JSON.parse(body)
      res.send(body)
    }
  )
}

exports.default = newRequest