const storage = require("./storageService"),
    request = require('request-promise'),
    tokenService = require('./tokenService'),
    fs = require('fs');

require("dotenv").config();

const api = process.env.API;
const authorId = process.env.AUTHORID;
const customerId = process.env.COSTOMERID;


//eventuell für Home
const getProjects = () => {
    //if token is expired try refresh

    let options = {
        uri: `${api}/api/v1/channels/1023/projects?page=0&size=200`,
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

const getAllActiveChannels = () => {

    return tokenService.provideAccessToken()
        .then(accessToken => {

            let options = {
                uri: `${api}/api/v1/channels?size=200`,
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
                    return response;
                })

        });


}

const getAllProjects = (maxDate, page) => {


    return tokenService.provideAccessToken()
        .then(accessToken => {

            let options = {
                uri: `${api}/api/v1/projects?maxCreatedDate=${maxDate}&authorId=${authorId}&customerId=${customerId}&page=0&size=200&page=${page}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json"
                },
                json: true
            };

            return request
                .get(options)
                .then(response => {
                    //console.log(response);
                    console.log('Get All Projects ==============================================================================================> END OF CALL');
                    return response;
                });
        });
}

const downloadAllData = (maxDate, workFolder) => {

    //gehört eigentlich in storageService
    if (workFolder === 'neuer Ordner') {
        workFolder = storageService.CreateNewFolder();
    }
    return getAllProjects(maxDate, 0)
        .then(projects => {
            pages = projects.totalPages;
            let counter = 0;

            for (let i = 0; i <= pages; i++) {

                return getAllProjects(maxDate, i)
                    .then(projects => {
                        projects.content.forEach(project => {
                            console.log('ForEach ' + project.projectId);
                            console.log('Seite ' + i);
                            counter ++;
                            /* return downloadThumbnail(project.projectId)
                                .then(file => {
                                    //file.pipe(fs.createWriteStream(`storage/${workFolder}/simvid_1.jpg`));
                                    return true;
                                }) */
                            //downloadVideo(project);
                            //downloadJson(project);
                        });
                        console.log(counter);
                    });


            }



        });




}

const downloadThumbnail = (projectId) => {

    let file = 'simvid_1.jpg'

    return tokenService.provideAccessToken()
        .then(accessToken => {
            let options = {
                uri: `${api}/content/${customerId}/${authorId}/${projectId}/${file}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };

            return request
                .get(options)
                .then(response => {
                    //console.log(response);
                    if (response.statusCode == 404) {
                        //hier falsche Filenamen Abfangen
                    }
                    return response;
                })

        });

}

module.exports = {
    getProjects,
    getAllActiveChannels,
    getAllProjects,
    downloadAllData
};
