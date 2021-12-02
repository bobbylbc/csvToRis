var fs = require("fs");
const path = require('path');

// ======= CONSTANTS =======
const RESULT_FOLDER = `${__dirname}/results`
const RESULT_FILE = `${RESULT_FOLDER}/firstLineOfFileResult.txt`


function appendToFile(content) {
    // console.log(content)
    fs.appendFileSync(RESULT_FILE, content + '\n')
}

function readFirstLineOfFile(filePath) {
    try {
        // READ CSV INTO STRING
        if (filePath.includes('.DS_Store')) return
        var data = fs.readFileSync(filePath).toLocaleString();
        // STRING TO ARRAY
        var rows = data.split("\n"); // SPLIT ROWS
        console.log(`${filePath} -> ${rows[0]}`)
        appendToFile(`${filePath} -> ${rows[0]}`)
    } catch (err) {
        console.error(err)
    }
}


function* walkSync(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name));
        } else {
            yield path.join(dir, file.name);
        }
    }
}

function clearResultFiles() {
    fs.writeFileSync(RESULT_FILE, '')
}


const readFirstLineOfFileFromDirectory = function readFirstLineOfFileFromDirectory(dir) {
    // Overwrite file to be empty again
    console.log(`Target directory: ${dir}`)
    fs.writeFileSync(RESULT_FILE, '')

    if (!fs.existsSync(RESULT_FOLDER)){
        fs.mkdirSync(RESULT_FOLDER);
    }

    clearResultFiles();

    for (const filePath of walkSync(dir)) {
        console.log(`Converting ${filePath} into ${RESULT_FILE}`)
        readFirstLineOfFile(filePath);
    }
    console.log(`Completed: Results are in ${RESULT_FILE}\n`)
}

//   readFirstLineOfFileFromASingleFilePath(CSV_FILE)
readFirstLineOfFileFromDirectory(`${__dirname}/sources/sySource_TypeB_2Dec2021`)