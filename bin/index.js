#! /usr/bin/env node
const fs = require('fs');
const process = require('process');
const commander = require('commander');
const program = require('../package.json');

/*
  The original package does not support programmatic invocation.
*/
// const cyclonedxbom = require('@cyclonedx/bom');
const cyclonedxbom = require('cyclonedx-bom-programmatic');

/*
  makeBom
  by Evan X. Merz

  This is intended to be a VERY simplified wrapper for cyclonedx/bom.
  It only creates json files.

  If run using npx, then it's just a pass-through to cyclonedx/bom,
  but the value here is in providing the makeBom method that can
  be run from another piece of code.
*/

function makeBom(inputFolderPath, outputFilePath) {
  let json = ""; // this will eventually hold our output

  // get the project path or use the current directory  
  let filePath = inputFolderPath || '.';
  if (!fs.existsSync(filePath)) {
    throw new Error('Folder path does not exist');
  }

  // set some default options just in case this was invoked programmatically
  let options = {
    serialNumber: "",
    includeLicenseText: false,
    output: outputFilePath,
    type: "library",
    includeDev: false,
  };

  // if this was run via command line, then pull in the cyclonedx/bom options
  if (require.main === module) {
    const cdx = new commander.Command();

    cdx
    .description(program.description)
    .version(program.version, '-v, --version')
    .argument('[path]', 'Path to analyze')
    .option('-d, --include-dev', 'Include devDependencies', false)
    .option('-l, --include-license-text', 'Include full license text', false)
    .option('-o, --output <output>', 'Write BOM to file', 'bom.json')
    .option('-t, --type <type>', 'Project type', 'library')
    .option('-ns, --no-serial-number', 'Do not include BOM serial number', true)
    .action((path) => {
      if (path) filePath = path
    })
    .parse(process.argv);
  
    options = cdx.opts();
  }
  
  const readInstalledOptions = { dev: options.includeDev }; // Options are specific to readinstalled
  
  /*
    Create a bom object and write it to a json file.

    This createbom method is slightly odd because it uses a callback rather
    than a return value, but it's not an asynchronous method. So, in order to
    avoid changing the underlying library, we are working around that call pattern.
  */
  cyclonedxbom.createbom(options.type, options.serialNumber, options.includeLicenseText, filePath, readInstalledOptions, (createbomError, bom) => {
    if (createbomError) {
      throw createbomError;
    }
  
    const writeFileCB = (writeFileError) => {
      if (writeFileError) {
        throw writeFileError;
      }
    }
  
    if (bom.components.length === 0) {
      console.info(
        'There are no components in the BOM.',
        'The project may not contain dependencies or node_modules does not exist.',
        'Executing `npm install` prior to CycloneDX may solve the issue.'
      )
    }
  
    // save the json and render a file
    json = bom.toJSON();
    fs.writeFile(options.output, json, writeFileCB)
  });

  return json;
}


module.exports = {
  makeBom,
};

// If called using npx, then run viewBom. Otherwise, do nothing
// See https://stackoverflow.com/questions/6398196/detect-if-called-through-require-or-directly-by-command-line
if (require.main === module) {
  makeBom();
}
