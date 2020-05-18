const storageService = require('./storageService'),
    request = require('request'),
    pRequest = require('request-promise'),
    tokenService = require('./tokenService'),
    fs = require('fs'),
    { infoLog, warnLog } = require('./loggerService'),
    sendStatus = require('../server'),
    progress = require('request-progress'),
    sem = require('semaphore')(10),
    async = require('async');

require('dotenv').config();

const api = process.env.API;
const authorId = process.env.AUTHORID;
const customerId = process.env.COSTOMERID;
let countAllVideoDownloads = 0;

const getProjectData = (projectId) => {
    return tokenService
        .provideAccessToken()
        .then((accessToken) => {
            let options = {
                uri: `${api}/api/v1/projects/${projectId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
                json: true,
            };
            return pRequest
                .get(options)
                .then((response) => {
                    //console.log(response);
                    return response;
                })
                .catch((err) => {
                    warnLog('Could not get Project-Data ' + err);
                });
        })
        .catch((fail) => {
            return fail;
        });
};

const getChannelProjects = (channel, size, page, sort = 'createdDate:asc') => {
    return tokenService.provideAccessToken().then((accessToken) => {
        let options = {
            uri: `${api}/api/v1/channels/${channel}/projects?page=${page}&size=${size}&sort=${sort}`, //Funktioniert im Moment nicht
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            json: true,
        };

        return pRequest
            .get(options)
            .then((response) => {
                //console.log(response);
                //console.log(`Get All Projects From Channel ${channel}===========================================================> END OF CALL`);
                return response;
            })
            .catch((err) => {
                warnLog('Fehler bei getChannelProjects ' + err);
                return err;
            });
    });
};

const getAllActiveChannels = () => {
    return tokenService.provideAccessToken().then((accessToken) => {
        let options = {
            uri: `${api}/api/v1/channels?size=200`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            json: true,
        };

        return pRequest
            .get(options)
            .then((response) => {
                //console.log(response);
                //console.log('Got all Channels=============================================================================>END OF CALL')
                return response;
            })
            .catch((err) => {
                warnLog('Fehler bei getAllActiveChannels ' + err);
                return err;
            });
    });
};

const getProjectChannel = (projectId) => {
    return tokenService.provideAccessToken().then((accessToken) => {
        let options = {
            uri: `${api}/api/v1/projects/${projectId}/channels?customerId=${customerId}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            json: true,
        };

        return pRequest
            .get(options)
            .then((response) => {
                //console.log(response);

                if (response.length < 1) {
                    return 0;
                }
                //console.log('Get Project Channel ==============================================================================================> END OF CALL');
                return response[0].id;
            })
            .catch((err) => {
                warnLog(`Fehler bei getProjectChannel Pid ${projectId}  ${err}`);
                return err;
            });
    });
};

const getAllProjects = (
    maxDate,
    size,
    page,
    sort = 'createdDate:asc',
    text = null
) => {
    let uri;
    if (text) {
        uri = `${api}/api/v1/projects?text=${text}&maxCreatedDate=${maxDate}&authorId=${authorId}&customerId=${customerId}&size=${size}&page=${page}&sort=${sort}`;
    } else {
        uri = `${api}/api/v1/projects?&maxCreatedDate=${maxDate}&authorId=${authorId}&customerId=${customerId}&size=${size}&page=${page}&sort=${sort}`;
    }
    return tokenService.provideAccessToken().then((accessToken) => {
        let options = {
            uri,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            json: true,
        };

        return pRequest
            .get(options)
            .then((response) => {
                //console.log(response);
                //console.log('Get All Projects ==============================================================================================> END OF CALL');
                return response;
            })
            .catch((err) => {
                warnLog('Fehler bei getAllProjects ' + err);
                //console.log('CATCH!!!!')
                return new Array();
            });
    });
};

const downloadSingleProject = async (projectId, folder) => {

    let workFolder = await storageService.createWorkFolder(folder);
    let channel = await getProjectChannel(projectId);
    let path = await storageService.createPath(
        workFolder,
        channel,
        projectId
    );
    downloadThumbnail(projectId, path, 'simvid_1.jpg');
    downloadJson(projectId, path);
    downloadVideo(projectId, path, 'simvid_1.mp4', 1);
    return Promise.resolve('download läuft....');
}

const downloadAllDataOld = async (maxDate, folder) => {
    countAllVideoDownloads = 0;
    let p1 = getAllProjects(maxDate, 200, 0);
    let p2 = storageService.createWorkFolder(folder);
    let workFolderInventory = [];
    const [totalProjects, workFolder] = await Promise.all([p1, p2]);

    let pages = totalProjects.totalPages;
    let counter = 0;

    (async () => {
        for (let i = 0; i < pages; i++) {

            let projects = await getAllProjects(maxDate, 200, i);

            for (let project of projects.content) {

                //To do Speicherabfrage einfügen


                //Hole eine Semaphore
                sem.take(async () => {
                    //Vor dem Download muss noch der Channel abgefragt werden um die korrekte Ordnerstruktur erstellen zu können
                    let channel = await getProjectChannel(project.projectId);
                    let path = await storageService.createPath(
                        workFolder,
                        channel,
                        project.projectId
                    );

                    downloadThumbnail(project.projectId, path, 'simvid_1.jpg'); //(simvid_1.jpg) => first bet

                    downloadVideo(
                        project.projectId,
                        path,
                        'simvid_1.mp4',
                        totalProjects.totalElements
                    ).then(() => {
                        sem.leave(); //Semaphoren freigeben, wenn alle Daten eines Projekts heruntergeladen sind.
                        console.log('Semaphore released'); //Promise wird immer resolved auch im Fehlerfall, damit download weitergeht.
                    });

                    downloadJson(project.projectId, path);

                    workFolderInventory.push(project.projectId);
                    counter++;

                    /* //funktioniert nicht, semaphore wird immer gleich freigegeben
                    Promise.all([downloadVideo]).then(() => {
                        sem.leave(); //Semaphoren freigeben, wenn alle Daten eines Projekts heruntergeladen sind.
                        console.log('Semaphore released');
                    });
                    */
                });
            }
            //console.log('Artikel ' + projects.totalElements + ' gefunden ' + counter);
            //console.log('Pages ' + pages + ' seitenzähler ' + i);
            fs.writeFile(
                `storage/${workFolder}/Projects.del`,
                JSON.stringify(workFolderInventory),
                (err) => {
                    if (err)
                        warnLog(
                            'Fehler beim schreiben des Projektinventars im Workfolder ' +
                            err
                        );
                    //console.log('Projektinventar erstellt');
                }
            );
        }
        console.log('countAllVideoDownloads ' + countAllVideoDownloads);
    })();
    return Promise.resolve('download läuft....');
};

const downloadThumbnail = (projectId, path, fileName) => {
    let fileStream = fs.createWriteStream(`${path}/${fileName}`);
    return tokenService
        .provideAccessToken()
        .then((accessToken) => {
            let options = {
                uri: `${api}/content/${customerId}/${authorId}/${projectId}/${fileName}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            try {
                request
                    .get(options)
                    .on('error', (err) => {
                        //Simplex hält sich nicht an ein stringentes Namenskonzept, über die Jahre änderten die immer mal wieder.
                        warnLog('FEHLER download Thumbnail ' + err.message);
                        if (err.statusCode === 404) {
                            let altFileName = '';

                            switch (fileName) {
                                case 'simvid_1.jpg':
                                    altFileName = 'simvid_1_med.jpg';
                                    break;
                            }
                            infoLog(
                                `Thumbnail ${fileName} nicht gefunden. Versuche ${altFileName}`
                            );
                            downloadThumbnail(
                                projectId,
                                workFolder,
                                altFileName
                            );
                        }
                    })
                    .pipe(fileStream);
            } catch (error) {
                warnLog(
                    `Fehler bei Versuch Thumbnail für ${path} herunterzuladen`
                );
                Promise.reject(
                    `Fehler bei Versuch Thumbnail für ${path} herunterzuladen`
                );
            }
        })
        .catch((err) => {
            warnLog(`Fehler bei Download-Thumbnail Methode (Token) ${error}`);
            resolve();
        });
};

const downloadVideo = (projectId, path, fileName, total) => {
    //sendStatus.sendMsg(JSON.stringify({ type: 'dlstat', id: projectId, detail: 'start', totalSize: null, percent: null}));
    return new Promise((resolve) => {
        let fileStream = fs.createWriteStream(`${path}/${fileName}`);
        return tokenService
            .provideAccessToken()
            .then((accessToken) => {
                let options = {
                    uri: `${api}/content/${customerId}/${authorId}/${projectId}/${fileName}`,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                };
                try {
                    progress(
                        request.get(options).on('error', (err) => {
                            //Simplex hält sich nicht an ein stringentes Namenskonzept, über die Jahre änderten die immer mal wieder.
                            warnLog('FEHLER download Thumbnail ' + err.message);
                            if (err.statusCode === 404) {
                                let altFileName = '';

                                switch (fileName) {
                                    case 'simvid_1.mp4':
                                        altFileName = 'simvid_1_1080.mp4';
                                        break;
                                    case 'simvid_1080.mp4':
                                        altFileName = 'simvid_720.mp4';
                                        break;
                                }
                                infoLog(
                                    `Video ${fileName} nicht gefunden. Versuche ${altFileName}`
                                );
                                downloadVideo(
                                    projectId,
                                    workFolder,
                                    altFileName,
                                    total -= 1
                                );
                            }
                        }),
                        { throttle: 1000, delay: 0 }
                    )
                        .on('progress', (state) => {
                            // Struktur des progres objekts:
                            // {
                            //     percent: 0.5,               // Overall percent (between 0 to 1)
                            //     speed: 554732,              // The download speed in bytes/sec
                            //     size: {
                            //         total: 90044871,        // The total payload size in bytes
                            //         transferred: 27610959   // The transferred payload size in bytes
                            //     },
                            //     time: {
                            //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
                            //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
                            //     }
                            // }
                            let status = {
                                type: 'dlstat',
                                id: projectId,
                                detail: 'progress',
                                totalSize: state.size.total,
                                percent: state.percent,
                            };
                            sendStatus.sendMsg(JSON.stringify(status));
                        })
                        .on('error', (err) => {
                            warnLog('Fehler bei Download ' + projectId);
                            resolve(); //Die Semaphoren sollen auch bei Fehlern wieder freigegeben werden, da sonst alles stoppen würde
                        })
                        .on('end', () => {
                            console.log('Finished with Download ' + projectId);
                        })
                        .pipe(fileStream)
                        .on('finish', () => {
                            sendStatus.sendMsg(
                                JSON.stringify({
                                    type: 'dlstat',
                                    id: projectId,
                                    detail: 'end',
                                    totalSize: null,
                                    percent: 1,
                                })
                            );
                            countAllVideoDownloads += 1;
                            //Die von Simplex angegebene gesammtmenge muss mit tatsächlichen Downloads verglichen werden
                            if (countAllVideoDownloads === total) {
                                sendStatus.sendMsg(
                                    JSON.stringify({
                                        type: 'dlend',
                                        detail: 'done',
                                    })
                                );
                            }
                            resolve();
                        })
                        .on('error', (err) => {
                            warnLog(
                                `Fehler beim Speichern von ${projectId} | ${err}`
                            );
                            resolve();
                        });
                } catch (error) {
                    //console.log('PIPE error ' + error);
                    warnLog(`Fehler bei Download-Video Methode ${error}`);
                    resolve();
                }
            })
            .catch((err) => {
                warnLog(`Fehler bei Download-Video Methode (Token) ${error}`);
                resolve();
            });
    });
};

const downloadJson = (projectId, path) => {
    let fileStream = fs.createWriteStream(`${path}/${projectId}.json`);
    return tokenService
        .provideAccessToken()
        .then((accessToken) => {
            let options = {
                uri: `${api}/api/v1/projects/${projectId}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
            };
            request
                .get(options)
                .on('error', (err) => {
                    //console.log('FEHLER download Json ' + err.message);
                    warnLog(
                        `Json download für ${projectId} gescheitert ${path}`
                    );
                })
                .on('response', (response) => {
                    //console.log(response.statusCode);
                    //console.log(response.headers['content-type']);
                })
                .pipe(fileStream);
        })
        .catch((err) => {
            warnLog(`Fehler bei Download-Jason Methode (Token) ${error}`);
        });
};

const updateProject = (projectId, data) => {
    //data muss ein gültiges Json-Objekt sein
    //console.log('id ' + projectId + ' dtat ' + data);
    return tokenService.provideAccessToken().then((accessToken) => {
        let options = {
            uri: `${api}/api/v1/projects/${projectId}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
            body: data,
            json: true,
        };

        return pRequest
            .post(options)
            .then((response) => {
                //console.log(response);
                //console.log('Update Project =================================================================================> END OF CALL');
                return { updated: true, response };
            })
            .catch((err) => {
                warnLog('Fehler bei updateProjects ' + err);
                return { error: true, err };
            });
    });
};

const deleteAllProjets = (ids) => {
    return new Promise(resolve => {
        let countAllVideoDeletions = 0;

        resolve("löschen gestartet....");


        async.eachLimit(ids, 10, (id, callback) => {
            console.log('lösche ' + id);

            getProjectChannel(id)
                .then(channel => {
                    if (channel === 0) {
                        deleteOnSimplex();
                    } else {
                        checkAws()
                            .then(() => deleteOnSimplex());
                    }
                })
                .catch(() => { callback(); })

            const checkAws = () => {
                //prüfen ob auf S3
                let options = {
                    uri: `https://telebasel-archiv.s3.eu-central-1.amazonaws.com/${id}/${id}.json`,
                    headers: {
                        Accept: 'application/json',
                    },
                    json: true,
                    resolveWithFullResponse: true
                };
                pRequest
                    .get(options)
                    .then((response) => {
                        console.log("AMAZON:  " + response.statusCode);
                        if (response.statusCode === 200) {
                            console.log(`${id} FOUND ON AMAZON`);
                            return true;
                        }

                    })
                    .catch((err) => {

                        sendStatus.sendMsg(JSON.stringify({ type: 'delstat', project: id, msg: 'Nicht auf S3 vorhanden, wird nicht gelöscht' }));
                        warnLog('Fehler bei Amazon Check ' + err);
                        warnLog(`${id} wurde nicht auf S3 gefunden und darum nicht gelöscht.`);
                        callback();
                    });
            }

            const deleteOnSimplex = () => {
                //Löschen 
                tokenService.provideAccessToken().then((accessToken) => {
                    let options = {
                        uri: `${api}/api/v1/projects/${id}`,
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            Accept: "application/json"
                        },
                        json: true,
                        resolveWithFullResponse: true
                    };
                    pRequest
                        .delete(options)
                        .then(response => {
                            countAllVideoDeletions += 1;

                            if (response.statusCode == '202') {
                                sendStatus.sendMsg(JSON.stringify({ type: 'delstat', project: id, msg: 'Projekt gelöscht' }));
                            }
                            callback();
                        })
                        .catch(err => {
                            warnLog(`Fehler bei deleteProjects id=${id} status: ${err.statusCode}`);
                            if (err.statusCode == '403') {
                                sendStatus.sendMsg(JSON.stringify({ type: 'delstat', project: id, msg: 'Projekt nicht auf Simplex' }));
                            }
                            callback();
                        });
                }).catch((err) => {
                    warnLog(`Fehler bei Delete-Video Methode (Token) ${err}`);
                    resolve();
                });
            }



        }, (err) => {
            if (err) {
                console.log("Fehler in eachLimit in DeletePR: ", err);
                warnLog('Fehler in LimitEach Löschschlaufe');
            } else {
                //Prüfen ob alle erfolgreich
                if (countAllVideoDeletions === ids.lenght - 1) {
                    sendStatus.sendMsg(JSON.stringify({ type: 'delend', detail: 'done' }));
                }
                console.log(`Report: ${countAllVideoDeletions} gelöscht. insgesammt ${ids.length - 1}`);
            }
        });

    })

};

const downloadAllData = async (maxDate, folder) => {

    return new Promise(async (resolve) => {
        resolve("Download läuft");
        countAllVideoDownloads = 0;
        let workFolderInventory = [];
        let p1 = getAllProjects(maxDate, 200, 0);
        let p2 = storageService.createWorkFolder(folder);
        const [totalProjects, workFolder] = await Promise.all([p1, p2]);
        let pages = totalProjects.totalPages;
        let totalProjectIds = totalProjects.totalElements;

        const goOn = async () => {
            fs.writeFile(
                `storage/${workFolder}/Projects.del`,
                JSON.stringify(workFolderInventory),
                (err) => {
                    if (err)
                        warnLog(
                            'Fehler beim schreiben des Projektinventars im Workfolder ' +
                            err
                        );
                    console.log('Projektinventar erstellt');
                }
            );
            /*
        async.eachLimit(workFolderInventory, 10, (projectId, done) => {

            getProjectChannel(projectId)
                .then(channel => {
                    storageService.createPath(workFolder, channel, projectId)
                        .then(path => {

                            storageService.checkIfFileOnDisk(`${path}/${projectId}.json`)
                                .then(exists => {

                                    if (!exists) {
                                        //await Promise.all([downloadThumbnail(projectId, path, 'simvid_1.jpg'), downloadVideo(projectId, path, 'simvid_1.mp4', totalProjectIds), downloadJson(projectId, path)]);
                                        downloadJson(projectId, path);
                                        downloadThumbnail(projectId, path, 'simvid_1.jpg');
                                        downloadVideo(projectId, path, 'simvid_1.mp4', totalProjectIds)
                                            .then(() => {
                                                done();
                                            })
                                    } else {
                                        console.log("File already on Disk");
                                        done();
                                    }
                                })
                        })
                })

        }, (err) => {
            if (err) {
                console.log("Fehler in eachLimit in DownloadAllProjects: ", err);
                warnLog('Fehler in LimitEach Downloadschlaufe');
            } else {
                console.log(`Report: ${countAllVideoDownloads} heruntergeladen. insgesammt ${workFolderInventory.length}`);
            }

        })
*/
        }

        for (let i = 0; i < pages; i++) {

            let projects = await getAllProjects(maxDate, 200, i);
            await Promise.all(projects.content.map(project => workFolderInventory.push(project.projectId)));

            if (workFolderInventory.length === totalProjectIds) {
                goOn();
            }
        }

    })

}


module.exports = {
    getChannelProjects,
    getAllActiveChannels,
    getAllProjects,
    downloadSingleProject,
    downloadAllData,
    getProjectData,
    updateProject,
    deleteAllProjets,
};
