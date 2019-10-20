const http = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const app = express();

router.get('/',function(req,res) {
  res.sendFile(path.join(__dirname+'/_site/index.html'));
  //__Dirname : resolve project folder
});

app.use(express.urlencoded())

app.post('/submit-form-nodeJS', (req, res) => {
    req.get('/submit-form.html');
    res.sendFile(path.join(__dirname+'/_site/submit-form.html'));
    const username = req.body.username;
    console.log(req.body);
    //res.end();
});

app.post('/login-form', (req, res) => {
  req.get('/login-form');
  res.sendFile(path.join(__dirname+'/_site/login-form.html'));
  const username = req.body.username;
  const password = req.body.password;
  console.log(req.body);
  //res.end();
});


// add the router
app.use(express.static(__dirname + '/_site'));

app.use('/', router);
// app.listen(process.env.port || 2000)

http.createServer(app).listen(2000, () => {
  console.log('Express server listening on port 2000');
});
