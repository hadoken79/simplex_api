const fs = require('fs');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const getFolders = path => readdirSync(path).filter(elem => statSync(join(path, elem)).isDirectory());

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

const createWorkFolder = folder => {
    return new Promise((resolve, reject) => {
        let folders = getFolders('storage');
        folders.sort((a, b) => a - b);


        if (folder === 'neuer Ordner') {
            if (folders.length > 0) {
                folder = parseInt(folders[folders.length - 1]) + 1;
            } else {
                folder = '1';
            }

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
    getDeleteIds
}



