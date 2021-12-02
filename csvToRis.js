var fs = require("fs");
const path = require('path');

// ======= CONSTANTS =======

const RESULT_FOLDER = `${__dirname}/results`
const RESULT_FILE = `${RESULT_FOLDER}/result.ris`
const AUDIT_FILE = `${RESULT_FOLDER}/audit_result.ris`

const SEPARATOR = '  - '
const RIS_START = `TY${SEPARATOR}JOUR`
const RIS_END = `ER${SEPARATOR}`
const CSV_RIS_MAP_TYPE_A = {
    '0': 'DO', // DOI
    '1': 'TI', // Title
    '2': 'C1', // PMID - not sure what is this, will just use 'Custom 1'
    '3': 'AU', // Authors
    '4': 'PY', // Publishing Year (YYYY)
    '5': 'SN', // ISBN/ISSN
    '6': 'C2', // Supporting cites - no matching, will just use 'Custom 2'
    '7': 'C3', // Contrasting cites - no matching, will just use 'Custom 3'
    '8': 'C4', // Mentioning cites - no matching, will just use 'Custom 4'
    '9': 'C5', // Total cites - no matching, will just use 'Custom 5'
    '10': 'LK', // Website Link
}

const CSV_RIS_MAP_TYPE_B = {
    '0': 'TI', // Item Title
    '1': 'LB', // Publication Title
    '2': 'J2', // Book Series Title
    '3': 'VL', // Journal Volume
    '4': 'IS', // Jounal Issue
    '5': 'DO', // Item DOI
    '6': 'A1', // Authors
    '7': 'PY', // Publication Year
    '8': 'UR', // URL
    '9': 'U1', // Content Type
}

let _formatType = 'TypeA'
let _totalRecords = 0

function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function (m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
}

function formatByTypeA(columns) {
    columns.forEach((col, idx) => {
        if (!col) return
        
        if (CSV_RIS_MAP_TYPE_A[idx] === 'AU') {
            try {
                const jsonLiteral = col.replace(/'/gi, '"')
                const authors = JSON.parse(jsonLiteral)

                authors.forEach((author) => {
                    appendToFile(`${CSV_RIS_MAP_TYPE_A[idx]}${SEPARATOR}${author.author_name}`)
                })
            } catch (err) {
                // console.warn(err)
            }
        }
        else if (CSV_RIS_MAP_TYPE_A[idx] === 'SN') {
            try {
                const jsonLiteral = col.replace(/'/gi, '"')
                const snList = JSON.parse(jsonLiteral)

                snList.forEach((sn) => {
                    appendToFile(`${CSV_RIS_MAP_TYPE_A[idx]}${SEPARATOR}${sn}`)
                })
            } catch (err) {
                // console.warn(err)
            }
        } else {
            appendToFile(`${CSV_RIS_MAP_TYPE_A[idx]}${SEPARATOR}${col}`)
        }

    })

}

function formatByTypeB(columns) {
    columns.forEach((col, idx) => {
        appendToFile(`${CSV_RIS_MAP_TYPE_B[idx]}${SEPARATOR}${col}`)
    })
}

function convertCsvToRis(filePath) {
    if (filePath.includes('.DS_Store')) return
    appendToAuditFile(`Converting ${filePath} into ${RESULT_FILE}`)
    try {
        // READ CSV INTO STRING
        var data = fs.readFileSync(filePath).toLocaleString();
        // STRING TO ARRAY
        var rows = data.split("\n"); // SPLIT ROWS
        rows.shift() // Remove header
        rows.forEach((row) => {
            columns = CSVtoArray(row)

            // If empty or null do not print
            if (!columns || columns.length < 1) return

            appendToFile(RIS_START)
            if (_formatType === 'TypeA') {
                formatByTypeA(columns)
            }

            if (_formatType === 'TypeB') {
                formatByTypeB(columns)
            }

            appendToFile(RIS_END + '\n')
            _totalRecords++
        })
        appendToAuditFile(`Total records process: ${rows.length}`)

    } catch (err) {
        console.error(err)
    }
}


// ========== Common Utitlities ===========
function appendToFile(content) {
    // console.log(content)
    fs.appendFileSync(RESULT_FILE, content + '\n')
}

function appendToAuditFile(content) {
    console.log(content)
    fs.appendFileSync(AUDIT_FILE, content + '\n')
}

function clearResultFiles() {
    fs.writeFileSync(RESULT_FILE, '')
    fs.writeFileSync(AUDIT_FILE, '')
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


// ========== Main Functions ==========
const convertCsvToRisFromDirectory = function convertCsvToRisFromDirectory(dir, type = 'TypeA') {
    // Set ris format type to be converted to
    _formatType = type
    if (!fs.existsSync(RESULT_FOLDER)){
        fs.mkdirSync(RESULT_FOLDER);
    }

    clearResultFiles();
    appendToAuditFile(`Target directory: ${dir}`)

    for (const filePath of walkSync(dir)) {
        convertCsvToRis(filePath);
    }
    appendToAuditFile(`Completed: Results are in ${RESULT_FILE}\n`)
    appendToAuditFile(`Total Records processed: ${_totalRecords}\n`)
}



convertCsvToRisFromDirectory(`${__dirname}/sources/sySource_TypeB_2Dec2021`, 'TypeB')