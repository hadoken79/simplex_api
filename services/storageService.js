//const fs = require('fs');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const getFolders = path => readdirSync(path).filter(elem => statSync(join(path, elem)).isDirectory());


module.exports = {
    getFolders
}



