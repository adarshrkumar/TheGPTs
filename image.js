var fs = require("fs");
var request = require("request");

// OpenAI API Key
var api_key = (my_secret = process.env["OPENAI_API_KEY"]);

function imageRequest(res, text_prompt, model='3', size={size: '1024x1024'}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${api_key}`,
  };

  const payload = {
    model: `dall-e-${model}`,
    prompt: text_prompt,
    n: 1,
    size: size.size, 
  };

  request.post(
    {
      headers: headers,
      url: "https://api.openai.com/v1/images/generations",
      body: JSON.stringify(payload),
    },
    function (error, result, body) {
      body = JSON.parse(body);
      if (body.error) {
        var err = body.error.message
        res.send({message: err, status: 'Error'})
      }
      else {
        data = body["data"];
        data.forEach(function (d) {
          url = d["url"];
          var status = url.includes('://') ? 'Success' : 'Error'
          res.send({status: status, url: url});
        });
      }
    },
  );
}

exports.default = imageRequest;