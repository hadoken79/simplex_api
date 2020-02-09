const storageService = require("./storageService"),
    request = require('request'),
    pRequest = require('request-promise'),
    tokenService = require('./tokenService'),
    fs = require('fs'),
    { infoLog, warnLog } = require('./loggerService');

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
                    //console.log(response);
                    console.log('================================================================================================>END OF CALL')
                    return response;
                })

        });


}

const getProjectChannel = projectId => {
    return tokenService.provideAccessToken()
        .then(accessToken => {
            let options = {
                uri: `${api}/api/v1/projects/${projectId}/channels?customerId=${customerId}`,
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

                    if (response.length < 1) {
                        return 0;
                    }
                    console.log('Get Project Channel ==============================================================================================> END OF CALL');
                    return response[0].id;
                });
        });
};

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

const downloadAllData = async (maxDate, folder) => {

    let totalProjects = await getAllProjects(maxDate, 0);
    let workFolderInventory = [];
    let workFolder = await storageService.createWorkFolder(folder);

    let pages = totalProjects.totalPages;
    let counter = 0;

    const loop = async () => {

        for (let i = 0; i < pages; i++) {

            console.log('i = ' + i);
            let projects = await getAllProjects(maxDate, i);

            for (let project of projects.content) {

                //ChannelCheck muss noch hier rein und die CreatePath Methode muss um den Channel erweitert werden
                let channel = await getProjectChannel(project.projectId);
                console.log('ForEach ' + project.projectId);
                let path = await storageService.createPath(workFolder, channel, project.projectId);


                counter++;

                await downloadThumbnail(project.projectId, path, 'simvid_1.jpg'); //(simvid_1.jpg) => first bet
                console.log('Thumb-downloaded');

                await downloadVideo(project.projectId, path, 'simvid_1.mp4'); //(simvid_1.mp4) => first bet
                console.log('Video-downloaded');

                await downloadJson(project.projectId, path);
                console.log('Json-downloaded');
                workFolderInventory.push(project.projectId);

            }
            console.log('Artikel ' + projects.totalElements + ' gefunden ' + counter);
            console.log('Pages ' + pages + ' seitenzähler ' + i);
            fs.appendFile(`storage/${workFolder}/Projects.del`, JSON.stringify(workFolderInventory), (err) => {
                if (err) warnLog('Fehler beim schreiben des Projektinventars im Workfolder ' + err);
                console.log('Projektinventar erstellt');
              });
        }
    }
    loop();
    
    return Promise.resolve('download begonnen....');
}

const downloadThumbnail = (projectId, path, fileName) => {

    let fileStream = fs.createWriteStream(`${path}/${fileName}`);
    return tokenService.provideAccessToken()
        .then(accessToken => {
            let options = {
                uri: `${api}/content/${customerId}/${authorId}/${projectId}/${fileName}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            try {
                request
                    .get(options)
                    .on('error', err => {
                        //Simplex hält sich nicht an ein stringentes Namenskonzept, über die Jahre änderten die immer mal wieder.
                        console.log('FEHLER download Thumbnail ' + err.message);
                        if (err.statusCode === 404) {
                            let altFileName = '';
                            
                            switch (fileName) {
                                case 'simvid_1.jpg':
                                    altFileName = 'simvid_1_med.jpg'
                                    break;
                            }
                            infoLog(`Thumbnail ${fileName} nicht gefunden. Versuche ${altFileName}`);
                            downloadThumbnail(projectId, workFolder, altFileName);
                            
                        }
                    })
                    .pipe(fileStream)
            } catch (error) {
                console.log('PIPE error ' + error);
                warnLog(`Fehler bei Versuch Thumbnail für ${path} herunterzuladen`);
                Promise.reject(`Fehler bei Versuch Thumbnail für ${path} herunterzuladen`);
            }
        });
}

const downloadVideo = (projectId, path, fileName) => {


    let fileStream = fs.createWriteStream(`${path}/${fileName}`);
    return tokenService.provideAccessToken()
        .then(accessToken => {
            let options = {
                uri: `${api}/content/${customerId}/${authorId}/${projectId}/${fileName}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            try {
                request
                    .get(options)
                    .on('error', err => {
                        //Simplex hält sich nicht an ein stringentes Namenskonzept, über die Jahre änderten die immer mal wieder.
                        console.log('FEHLER download Thumbnail ' + err.message);
                        if (err.statusCode === 404) {
                            let altFileName = '';
                            
                            switch (fileName) {
                                case 'simvid_1.mp4':
                                    altFileName = 'simvid_1_1080.mp4'
                                    break;
                                    case 'simvid_1080.mp4':
                                    altFileName = 'simvid_720.mp4'
                                    break;
                            }
                            infoLog(`Thumbnail ${fileName} nicht gefunden. Versuche ${altFileName}`);
                            downloadThumbnail(projectId, workFolder, altFileName);
                            
                        }
                    })
                    .pipe(fileStream)
            } catch (error) {
                console.log('PIPE error ' + error);
                warnLog(`Fehler bei Versuch Video für ${path} herunterzuladen`);
                Promise.reject(`Fehler bei Versuch Video für ${path} herunterzuladen`);
            }
        });
}

const downloadJson = (projectId, path) => {

    let fileStream = fs.createWriteStream(`${path}/${projectId}.json`);
    return tokenService.provideAccessToken()
        .then(accessToken => {
            let options = {
                uri: `${api}/api/v1/projects/${projectId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json"
                }
            };
            request
                .get(options)
                .on('error', err => {
                    
                        console.log('FEHLER download Json ' + err.message);
                        warnLog(`Json download für ${projectId} gescheitert ${path}`);
                })
                .on('response', response => {
                    console.log(response.statusCode);
                    console.log(response.headers['content-type']);
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
