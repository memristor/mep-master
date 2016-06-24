class Task {
	onRun() {
		console.log('Override onRun() please.');
	}
	
	onEnemyDetected(status) {
		// Default action on enemy detected
	}
	
	onStacked(status) {
		//status.action = '';
		// Default action on stacked
	}
}

module.exports = Task;