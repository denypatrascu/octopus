function populateActions(actions, solution, app) {
	actions.push( {
		"type": "copy",
		"src": `./${app}/seed`,
		"target": `./web-server/${solution}/apps/${app}/seed`,
		"options": {
			overwrite: true
		}
	});
	actions.push({
		"type": "mkdir",
		"target": `./web-server/${solution}/${app}-template`
	});
}

module.exports = {populateActions};