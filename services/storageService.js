const fs = require('fs');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const getFolders = path => readdirSync(path).filter(elem => statSync(join(path, elem)).isDirectory());

const createNewFolder = () => {
    //ToDo Rheienfolde und Foldernamen
    let folders = getFolders('storage');
    folders.sort((a, b) => a - b);
    console.log('Folders ' + folders);
    console.log('new ' + folders[folders.length - 1] + 1);
    fs.mkdirSync(`storage/${(folders[folders.length - 1]) + 1}`, { recursive: true });
}



module.exports = {
    getFolders,
    createNewFolder
}



