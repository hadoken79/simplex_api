const
    storage = require('./storageService'),
    request = require('request-promise');

require('dotenv').config();

const api = process.env.API;
let token = storage.readTokens; //müssen über file geregelt werden noch unklar ob StorageService oder andere
let refreshToken = process.env.REFRESHTOKEN;



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
    }

    request.post(options)
        .then(tokenResponse => {
            console.log(tokenResponse);
            token = tokenResponse.access_token;
            refToken = tokenResponse.refresh_token;
            res.send('okily dokily')
        })
        .catch(err => {
            console.log(err.message);
        })
}

const refreshAccessToken = () => {

    //if refresh fails, get new token
    let options = {
        uri: `${api}/refresh_token`,
        headers: {
            Authorization: `Bearer ${refreshToken}`,
            Accept: "application/json"
        },
        json: true
    }

    request.post(options)
        .then(tokenResponse => {
            console.log(tokenResponse);
            token = tokenResponse.access_token;
            refToken = tokenResponse.refresh_token;
            res.send('okily dokily! Got a Refresh-Token')
        })
        .catch(err => {
            if (err.statusCode === 401) {
                getAccessToken();
            }

        })

}


const getProjectData = (req, res) => {
    //if token is expired try refresh
    let options = {
        uri: `${api}/api/v1/channels/1023/projects?page=1&size=2`,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
        },
        json: true
    }

    request.get(options)
        .then(response => {
            console.log(response);
            res.send('okily dokily!');
        })
        .catch(err => {
            console.log(err.statusMessage);
            console.log(err.statusCode);
            if (err.statusCode === 401) {
                refreshAccessToken();
            }

        })
}

module.exports = {
    getAccessToken,
    getProjectData
}