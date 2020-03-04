const request = require('request-promise');

require("dotenv").config();

const api = process.env.API;
let accessToken = '';
let refreshToken = '';
let expiresIn = 1;

//Initialcall oder wenn Refreshtoken nicht mehr gültig, an api um ein token zu erzeugen (30min gültig)

const getAccessToken = (username, password) => {
    console.log('Try to Create a new Token');
    console.log(`${username} | ${password}`);
    //username = process.env.USER;
    //password = process.env.PASSWORD;
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
            console.log(accessToken);
            return true;
        })
        .catch(err => {
            console.log('failed somehow to create a token');
            console.log(err.message);
            return false;
        });
};

//Sobald die provideAccessToken Methode das Token als zu alt einstuft, oder eine 401 Antwort der Api kommt, wird ein Refresh versucht.
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
        //um unnötigen Traffic zu vermeiden, kann erst intern geprüft werden, ob das Token abgelaufen ist.
        if (expiresIn <= Date.now()) {
            console.log('provideToken | abgelaufen! exp: ' + expiresIn + ' now: ' + Date.now())
            return refreshAccessToken()
                .then(() => {
                    resolve(accessToken);
                })
                .catch(err => {
                    if (err.statusCode === 401) {
                        console.log('provideToken | unable to refresh Token');
                        getAccessToken()
                            .then(() => {
                                resolve(accessToken);
                            }).catch(() => {
                                reject('Could not Create or Refresh a Token');
                            })
                    }
                });
        }
        console.log('provideToken | müsste noch gültig sein.')
        resolve(accessToken);
    });

};

module.exports = {
    getAccessToken,
    refreshAccessToken,
    provideAccessToken
};