const fs = require('fs');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const getFolders = path => {
    let folders = readdirSync(path).filter(elem => statSync(join(path, elem)).isDirectory());
    let nfolders = folders.filter(f => !isNaN(parseInt(f)));
    return nfolders;
}

const getDeleteIds = (folder) => {
    return new Promise((resolve, reject) => {
        console.log(folder);
        fs.readFile(`storage/${folder}/Projects.del`, 'utf8', (err, data) => {
            if (err) {
                reject(err);

            }
            resolve(JSON.parse(data));
        })
    })

}

const checkIfFileOnDisk = path => {
    return new Promise((resolve) => {

        fs.access(path, fs.constants.R_OK, (err) => {

            resolve(err ? false : true);

        })
    })

}

const createWorkFolder = folder => {
    return new Promise((resolve, reject) => {
        let folders = getFolders('storage');

        let nfolders = folders.filter(f => !isNaN(parseInt(f)));
        folders.sort((a, b) => a - b);


        if (folder === 'neuer Ordner') {
            if (nfolders.length > 0) {
                folder = parseInt(nfolders[nfolders.length - 1]) + 1;
            } else {
                folder = '1';
            }
            fs.mkdir(`storage/${folder}`, { recursive: true }, (err) => {
                if (err) {
                    reject(err);
                }
            });
        }
        resolve(folder);
    });
};

const createPath = (workFolder, channel, projectId) => {
    return new Promise((resolve, reject) => {


        let path = `storage/${workFolder}/${channel}/${projectId}`;
        console.log('Pfad ' + path);

        fs.mkdir(path, { recursive: true }, () => {
            resolve(path);
        });

    });

};



module.exports = {
    getFolders,
    createPath,
    createWorkFolder,
    getDeleteIds,
    checkIfFileOnDisk
}



