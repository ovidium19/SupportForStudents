const fs = require('fs');
const path = require('path');
const debug = require('debug')('app:githubAuth');
const axios = require('axios');
const btoa =require('base64url');

const rootPath = path.normalize(__dirname+"/../");

function exchangeCode(req,res){
  //this function creates on OAuth authorization link and sends it back to the controller
  //to redirect to it via $location
  if (req.query.connection){
    let url = '';
    let client_id = process.env.GITHUB_CLIENT_ID.trim();
    let scope = "repo";
    let redirect_uri = process.env.GITHUB_REDIRECT.trim();
    let base = "https://github.com/login/oauth/authorize";
    url = `${base}?scope=${scope}&client_id=${client_id}&redirect_uri=${redirect_uri}`;
    res.send({
      url,
      redirect:true
    });
    res.end();
    return;
  }
}
function revokeToken(token){
  //this function takes a token and creates a Github API url to revoke the token
  //this happens every time you successfully enter the correct username and password
  //to enforce proper github authentication as well
  const url = `https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID.trim()}/tokens/${token}`;
  const username = process.env.GITHUB_CLIENT_ID.trim();
  const password = process.env.GITHUB_CLIENT_SECRET.trim();
  const params = `${username}:${password}`;
  return axios({
    method: 'DELETE',
    url,
    headers:{
      "Authorization": "Basic " +  btoa.encode(params)
    },
    params: {
      username,
      password
    },
    withCredentials: true
  });
}

module.exports.get = function(req,res){
    //creates the url to request code and sends it back to the AngularJS controller (in exchangeCode)
    //alternative way by using environment variables
    if (req.query.available){
      debug("Requesting if available");
      if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_REDIRECT || !process.env.GITHUB_LOGIN){
        res.send({response: false})
      }
      else{
        res.send({response: true})
      }
    }
    else{
      exchangeCode(req,res);
      return;
    }
 
};
module.exports.localAuth = function(req,res){
    console.log("going to check for locl authentication");
    //Simplified auth ... just check against env variables
    //localAuth is responsible for checking if the correct username and password have been sent to the server
    let user = req.body;
    console.log(user);
    if (user.username === process.env.USERNAME.trim() && user.password === process.env.PASSWORD.trim()){
        debug("USers match");
        res.status(200).send({response:true});
        res.end();
        return;
    }
    else{
        res.status(400).send('Bad Request');
        res.end();
        return;
    }
};
module.exports.getAuth = function(req,res){
  //this function handles the exchange from code to OAuth for GitHub (See docs)
  //uses axios for http calls to Github API
  let code = req.query.code;
  if (code){
    //exchange code for token
    axios({
      method: 'POST',
      url: 'https://github.com/login/oauth/access_token',
      data:{
        code,
        client_id: process.env.GITHUB_CLIENT_ID.trim(),
        client_secret: process.env.GITHUB_CLIENT_SECRET.trim(),
        redirect_uri: process.env.GITHUB_REDIRECT.trim(),
      },
      headers: {'Accept': 'application/json'}
    })
      .then(function(response){
        //we got token from code, must save
        //we get token here, have to save token to file. After it is saved, we can redirect to /admin, which will check the
        //file for an active token. Will then use that token to grant access to the page
        const token = response.data.access_token;
        debug("Got token");
        debug(token);
        //get user login
        axios({
          method: 'GET',
          url: 'https://api.github.com/user?access_token='+response.data.access_token,
        })
          .then(function(response) {
              //save user login and user token to the user file
              const login = response.data.login;
              if (login !== process.env.GITHUB_LOGIN.trim()) {
                  revokeToken(token).then(response => {
                      res.redirect("/authenticate?user=false")
                  });
              }
              else {
                  res.redirect("/authenticate?auth=true");
              }
          })
            .catch(err =>{
                debug(err);
                res.redirect("/authenticate?user=false");
            })
      })
  }
  else{
      debug("No code");
      res.redirect("/authenticate?user=false")
  }
};
module.exports.localAvailable = function(req,res){
  console.log(process.env.USERNAME);
  console.log(process.env.PASSWORD);
    if (process.env.USERNAME && process.env.PASSWORD){
    
        res.send({response: true});
    }
    else{
        res.send({response: false});
    }
    res.end();
    return;
};
