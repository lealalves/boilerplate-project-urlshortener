require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({extended: true}))

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
	res.json({ greeting: 'hello API' });
});


const urlList = []

const searchUrl = (url_id) => {
	let url = urlList.filter(({short_url}) => short_url == url_id) 

	if(url.length > 0) {
		return url
	} else {
		return null
	}

}

const addUrlList = (url) => {
  console.log(urlList);
  let searchUrl = urlList.filter(({original_url}) => original_url == url)

  if(searchUrl.length == 0){
    let newUrl = {
      original_url: url,
      short_url: urlList.length + 1
    }
  
    urlList.push(newUrl)
  
    return newUrl
  }

  return searchUrl[0]


}

const checkUrl = (req, res, next) => {
	let url = req.body.url
	let regex = /^https?:\/\//
	let new_url = url.replace(regex, '')

	if(!regex.test(url)){
	  return res.send({error: 'invalid url'})
	}
	
	dns.lookup(new_url, {all: true}, (err, add) => {
		if(err) return res.send({error: 'invalid url'});
		next()
	})
}

app.route('/api/shorturl/:id?')
.post(checkUrl, (req, res) => {
	res.send(addUrlList(req.body.url))
})
.get((req, res) => {
	let url = searchUrl(req.params.id)

	if(!url){
		return res.send({error: 'No short URL found for the given input'})
	}
	
	res.redirect(url[0].original_url)


})




app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});
