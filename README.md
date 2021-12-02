# csvToRis 

## What is this about?
This is a mini project to help those who wants a simple software to converts csv files into ris format 
ris format reference: https://en.wikipedia.org/wiki/RIS_(file_format)

## How to use?
- readFirstLineOfFile.js -> get all the headers of the files you want to process from a directory
- csvToRis.js -> manipulate all your csv files from a directory and generate ris format files base in the results folder

## Disclaimer
This is still very raw and will likely fail if non-csv files are passed in


Supported format are as follow:
```
TYPE_A
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
```
```
TYPE_B
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
```