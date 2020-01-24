const storage = require("./storageService"),
  request = require('request-promise'),
  fs = require("fs");

require("dotenv").config();


const api = process.env.API;
let token = '';
let refToken = '';

const getAccessToken = (req, res) => {

  //with user credentails
  let options = {
    uri: `${api}/login`,
    form: {
      username: process.env.USER,
      password: process.env.PASSWORD
    },
    headers: {
      Accept: "application/json"
    },
    json: true
  };

  return request
    .post(options)
    .then(tokenResponse => {
      console.log(tokenResponse);
      console.log('got me a new token');
      token = tokenResponse.access_token;
      refToken = tokenResponse.refresh_token;
      return token;
    })
    .catch(err => {
      console.log('failed somehow to create a token');
      console.log(err.message);
      return err.message;
    });
};

const refreshAccessToken = () => {
  //if refresh fails, get new token
  let options = {
    uri: `${api}/refresh_token`,
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      Accept: "application/json"
    },
    json: true
  };

  request
    .post(options)
    .then(tokenResponse => {
      console.log(tokenResponse);
      console.log('successfully refreshed Token');
      token = tokenResponse.access_token;
      refToken = tokenResponse.refresh_token;
    })
    .catch(err => {
      if (err.statusCode === 401) {
        console.log('not able to refreshed Token');
        console.log('try to get a new one');
        getAccessToken();
      }
    });
};

const getProjects = () => {
  //if token is expired try refresh

  let options = {
    uri: `${api}/api/v1/channels/1023/projects?page=1&size=2`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    json: true
  };

  request
    .get(options)
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.log(err.statusMessage);
      console.log(err.statusCode);
      if (err.statusCode === 401) {
        refreshAccessToken();
      }
    });

};

const testCall = () => {

  let options = {
    uri: `${api}/api/v1/channels/1023/projects?page=1&size=2`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    json: true
  };

  request
    .get(options)
    .then(response => {
      console.log(response);
      console.log('accepted');
    })
    .catch(err => {
      console.log(err.statusMessage);
      console.log(err.statusCode);
      console.log('token rejected');
      if (err.statusCode === 401) {
        console.log('trying to refresh');
        refreshAccessToken();
      }
    });

}

module.exports = {
  getProjects,
  testCall
};
