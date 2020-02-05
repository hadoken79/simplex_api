const storageService = require("./storageService"),
    request = require('request'),
    pRequest = require('request-promise'),
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

    pRequest
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

            return pRequest
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
                uri: `${api}/api/v1/projects?maxCreatedDate=${maxDate}&authorId=${authorId}&customerId=${customerId}&size=200&page=${page}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json"
                },
                json: true
            };

            return pRequest
                .get(options)
                .then(response => {
                    //console.log(response);
                    console.log('Get All Projects ==============================================================================================> END OF CALL');
                    return response;
                });
        });
}

const downloadAllData = async (maxDate, workFolder) => {

    //gehört eigentlich in storageService
    if (workFolder === 'neuer Ordner') {
        workFolder = await storageService.createNewFolder();
    }

    return getAllProjects(maxDate, 0)
        .then(projects => {

            pages = projects.totalPages;
            let counter = 0;

            const loop = async () => {

                for (let i = 0; i < pages; i++) {

                    console.log('i = ' + i);
                    await getAllProjects(maxDate, i)
                        .then(projects => {
                            projects.content.forEach(project => {
                                //Für alle download-Methoden den Pfad ersetellen.
                                fs.mkdirSync(`storage/${workFolder}/${project.projectId}`, { recursive: true });
                                console.log('ForEach ' + project.projectId);
                                counter++;

                                return downloadThumbnail(project.projectId, workFolder);


                                //downloadVideo(project);
                                //downloadJson(project);

                            });

                        });
                    console.log('Artikel ' + projects.totalElements + ' gefunden ' + counter);
                    console.log('Pages ' + pages + ' seitenzähler ' + i);
                }
            }
            loop();
        });
}

const downloadThumbnail = (projectId, workFolder) => {
    //first Guess
    let file = 'simvid_1.jpg';

    let fileStream = fs.createWriteStream(`storage/${workFolder}/${projectId}/${file}`);
    return tokenService.provideAccessToken()
        .then(accessToken => {
            let options = {
                uri: `${api}/content/${customerId}/${authorId}/${projectId}/${file}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };

            request
                .get(options)
                .on('error', err => {
                    console.log('FEHLER download Thumbnail ' + err.message);
                    if (err.statusCode === 404) {
                        switch (file) {
                            case 'simvid_1.jpg':
                                file = 'simvid_1_med.jpg';
                                break;
                        }
                        downloadThumbnail(projectId, workFolder);
                    }
                })
                .pipe(fileStream)
        });

}

module.exports = {
    getProjects,
    getAllActiveChannels,
    getAllProjects,
    downloadAllData
};
