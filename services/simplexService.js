const storage = require("./storageService"),
    request = require('request-promise'),
    fs = require("fs"),
    tokenService = require('./tokenService');

require("dotenv").config();

const api = process.env.API;



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

    return tokenService.provideAccessToken()
        .then(accessToken => {

            let options = {
                uri: `${api}/api/v1/channels?size=2`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json"
                },
                json: true
            };

            return request
                .get(options)
                .then(response => {
                    console.log(response);
                    console.log('================================================================================================>END OF CALL')
                    return 'okily dokily';
                })

        });


}

module.exports = {
    getProjects,
    testCall
};
