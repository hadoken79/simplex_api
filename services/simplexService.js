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
                    console.log(response);
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

                await downloadThumbnail(project.projectId, path);
                console.log('Thumb-downloaded');

                //await downloadVideo(project.projectId, path);
                //console.log('Video-downloaded');

                //await downloadJson(project.projectId, path);
                //console.log('Json-downloaded');

            }
            console.log('Artikel ' + projects.totalElements + ' gefunden ' + counter);
            console.log('Pages ' + pages + ' seitenzähler ' + i);
        }
    }
    loop();
}

const downloadThumbnail = (projectId, path) => {
    //first Guess
    let file = 'simvid_1.jpg';

    let fileStream = fs.createWriteStream(`${path}/${file}`);
    return tokenService.provideAccessToken()
        .then(accessToken => {
            let options = {
                uri: `${api}/content/${customerId}/${authorId}/${projectId}/${file}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            try {
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
            } catch (error) {
                console.log('PIPE error ' + error);
                warnLog(`Fehler bei Versuch Thumbnail für ${path} herunter zu laden`);
            }


        });

}

module.exports = {
    getProjects,
    getAllActiveChannels,
    getAllProjects,
    downloadAllData
};
