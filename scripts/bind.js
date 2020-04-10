const args = process.argv;
const TYPE_ARGUMENT = "--type=";
args.splice(0, 2);

let bindType = "app";
if (typeof args[0] !== "undefined" && args[0].indexOf(TYPE_ARGUMENT) !== -1) {
	bindType = args.splice(0, 1);
	bindType = bindType[0].replace(TYPE_ARGUMENT, "");
}

const octopus = require("./index.js");
if (args.length !== 2) {
	octopus.handleError("Expected to receive 2 params: <solutionName> and <targetName>.");
}

const solutionName = args[0];
const targetName = args[1];

const config = octopus.readConfig();

function buildIdentifier() {
	return `${solutionName}_bind_to_${targetName}`;
}

let loaderConfigIndex;
let walletConfigIndex;
let binDep;
for (let i = 0; i < config.dependencies.length; i++) {
	let dep = config.dependencies[i];
	if (dep.name === solutionName) {
		loaderConfigIndex = i;
	}

	if (dep.name === targetName) {
		walletConfigIndex = i;
	}

	if (dep.name === buildIdentifier()) {
		binDep = config.dependencies[i];
	}
}

if (typeof loaderConfigIndex === "undefined") {
	octopus.handleError(`Unable to find a solution config called "${solutionName}"`)
}

if (typeof walletConfigIndex === "undefined") {
	octopus.handleError(`Unable to find a wallet/app config called "${targetName}"`)
}

if (typeof binDep === "undefined") {
	binDep = {
		"name": buildIdentifier(),
		"src": ""
	};

	config.dependencies.push(binDep);
}

binDep.actions = [];
switch (bindType) {
	case "wallet":
		let walletAction = require("./bindWallet").populateActions(binDep.actions, solutionName, targetName);
		break;
	case "app":
		let appAction = require("./bindApp").populateActions(binDep.actions, solutionName, targetName);
		break;
	default:
		throw new Error("Unrecognized type");
}

octopus.runConfig(octopus.createBasicConfig(binDep), function (err) {
	if (err) {
		throw err;
	}
	octopus.updateConfig(config, function (err) {
		if (err) {
			throw err;
		}
		console.log("Bind successful and config updated!");
	});
});