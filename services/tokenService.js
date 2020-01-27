const request = require('request-promise');

require("dotenv").config();

const api = process.env.API;
let accessToken = '';
let refreshToken = '';
let expiresIn = 1;

const getAccessToken = (username, password) => {
    console.log('Try to Create a new Token');
    console.log(`${username} | ${password}`);
    //with user credentails, sollten über LoginController kommen
    let options = {
        uri: `${api}/login`,
        form: {
            username: username,
            password: password
        },
        headers: {
            Accept: "application/json"
        },
        json: true
    };

    return request
        .post(options)
        .then(tokenResponse => {
            console.log('got me a new token');
            accessToken = tokenResponse.access_token;
            refreshToken = tokenResponse.refresh_token;
            expiresIn = (tokenResponse.expires_in * 1000) + Date.now();
            //console.log('Jetzt: ' + Date.now());
            //console.log('exp: ' + tokenResponse.expires_in);
            //console.log('expkomplett: ' + expiresIn);
            return true;
        })
        .catch(err => {
            console.log('failed somehow to create a token');
            console.log(err.message);
            return false;
        });
};

const refreshAccessToken = () => {

    let options = {
        uri: `${api}/refresh_token`,
        headers: {
            Authorization: `Bearer ${refreshToken}`,
            Accept: "application/json"
        },
        json: true
    };

    return request
        .post(options)
        .then(tokenResponse => {
            console.log('successfully refreshed Token');
            accessToken = tokenResponse.access_token;
            refreshToken = tokenResponse.refresh_token;
            expiresIn = (tokenResponse.expires_in * 1000) + Date.now();
            return true;
        });

};

const provideAccessToken = () => {

    return new Promise((resolve, reject) => {

        if (expiresIn <= Date.now()) {
            console.log('abgelaufen! exp: ' + expiresIn + ' now: ' + Date.now())
            return refreshAccessToken()
                .then(() => {
                    resolve(accessToken);
                })
                .catch(err => {
                    if (err.statusCode === 401) {
                        console.log('unable to refresh Token');
                        getAccessToken()
                            .then(() => {
                                resolve(accessToken);
                            }).catch(() => {
                                reject('Could not Create or Refresh a Token');
                            })
                    }
                });
        }
        console.log('müsste noch gültig sein.')
        resolve(accessToken);
    });

};

module.exports = {
    getAccessToken,
    refreshAccessToken,
    provideAccessToken
};