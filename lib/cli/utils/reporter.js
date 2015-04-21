'use strict';

var chalk = require('chalk');
var prettyMs = require('pretty-ms');

var events = require('../../events');

module.exports = function(api) {
	addListeners(api);

	return function detach() {
		removeListeners(api);
	};

	function logInfo(message) {
		api.utils.log(chalk.black(message));
	}

	function logWarning(message) {
		api.utils.log(chalk.yellow(message));
	}

	function logError(message) {
		api.utils.log(chalk.red(message));
	}

	function logSuccess(message) {
		api.utils.log(chalk.bold(message));
	}


	function addListeners(api) {
		api.on(events.INIT_PROJECT_STARTED, onInitProjectStarted);
		api.on(events.INIT_PROJECT_FAILED, onInitProjectFailed);
		api.on(events.INIT_PROJECT_COMPLETED, onInitProjectCompleted);
		api.on(events.INIT_PROJECT_NPM_INIT_NEEDED, onInitProjectNpmInitNeeded);
		api.on(events.INIT_PROJECT_API_INSTALL_NEEDED, onInitProjectApiInstallNeeded);

		api.on(events.INSTALL_PACKAGE_STARTED, onInstallPackageStarted);
		api.on(events.INSTALL_PACKAGE_FAILED, onInstallPackageFailed);
		api.on(events.INSTALL_PACKAGE_COMPLETED, onInstallPackageCompleted);

		api.on(events.UNINSTALL_PACKAGE_STARTED, onUninstallPackageStarted);
		api.on(events.UNINSTALL_PACKAGE_FAILED, onUninstallPackageFailed);
		api.on(events.UNINSTALL_PACKAGE_COMPLETED, onUninstallPackageCompleted);

		api.on(events.UPDATE_PACKAGE_STARTED, onUpdatePackageStarted);
		api.on(events.UPDATE_PACKAGE_FAILED, onUpdatePackageFailed);
		api.on(events.UPDATE_PACKAGE_COMPLETED, onUpdatePackageCompleted);

		api.on(events.TASK_STARTED, onTaskStarted);
		api.on(events.TASK_FAILED, onTaskFailed);
		api.on(events.TASK_COMPLETED, onTaskCompleted);
	}


	function removeListeners(api) {
		api.removeListener(events.INIT_PROJECT_STARTED, onInitProjectStarted);
		api.removeListener(events.INIT_PROJECT_FAILED, onInitProjectFailed);
		api.removeListener(events.INIT_PROJECT_COMPLETED, onInitProjectCompleted);
		api.removeListener(events.INIT_PROJECT_NPM_INIT_NEEDED, onInitProjectNpmInitNeeded);
		api.removeListener(events.INIT_PROJECT_API_INSTALL_NEEDED, onInitProjectApiInstallNeeded);

		api.removeListener(events.INSTALL_PACKAGE_STARTED, onInstallPackageStarted);
		api.removeListener(events.INSTALL_PACKAGE_FAILED, onInstallPackageFailed);
		api.removeListener(events.INSTALL_PACKAGE_COMPLETED, onInstallPackageCompleted);

		api.removeListener(events.UNINSTALL_PACKAGE_STARTED, onUninstallPackageStarted);
		api.removeListener(events.UNINSTALL_PACKAGE_FAILED, onUninstallPackageFailed);
		api.removeListener(events.UNINSTALL_PACKAGE_COMPLETED, onUninstallPackageCompleted);

		api.removeListener(events.UPDATE_PACKAGE_STARTED, onUpdatePackageStarted);
		api.removeListener(events.UPDATE_PACKAGE_FAILED, onUpdatePackageFailed);
		api.removeListener(events.UPDATE_PACKAGE_COMPLETED, onUpdatePackageCompleted);

		api.removeListener(events.TASK_STARTED, onTaskStarted);
		api.removeListener(events.TASK_FAILED, onTaskFailed);
		api.removeListener(events.TASK_COMPLETED, onTaskCompleted);
	}

	function onInitProjectStarted(eventData) {
		logInfo('Initializing project at ' + chalk.magenta(eventData.path));
	}

	function onInitProjectFailed(eventData) {
		logError('Failed to initialize project at ' + chalk.magenta(eventData.path));
	}

	function onInitProjectCompleted(eventData) {
		logSuccess('Initialized project at ' + chalk.magenta(eventData.path));
	}

	function onInitProjectNpmInitNeeded(eventData) {
		logWarning('No package.json file found at ' + chalk.magenta(eventData.path));
		logInfo('Follow the prompts to initialize a new npm module:');
	}

	function onInitProjectApiInstallNeeded(eventData) {
		logInfo('Installing API module for use in local tasks...');
	}

	function onInstallPackageStarted(eventData) {
		logInfo('Installing package ' + chalk.magenta(eventData.package));
	}

	function onInstallPackageFailed(eventData) {
		logError('Failed to install package ' + chalk.magenta(eventData.package));
	}

	function onInstallPackageCompleted(eventData) {
		logSuccess('Installed package ' + chalk.magenta(eventData.package + '@' + eventData.version));
	}

	function onUninstallPackageStarted(eventData) {
		logInfo('Uninstalling package ' + chalk.magenta(eventData.package));
	}

	function onUninstallPackageFailed(eventData) {
		logError('Failed to uninstall package ' + chalk.magenta(eventData.package));
	}

	function onUninstallPackageCompleted(eventData) {
		logSuccess('Uninstalled package ' + chalk.magenta(eventData.package));
	}

	function onUpdatePackageStarted(eventData) {
		logInfo('Updating package ' + chalk.magenta(eventData.package));
	}

	function onUpdatePackageFailed(eventData) {
		logError('Failed to update package ' + chalk.magenta(eventData.package));
	}

	function onUpdatePackageCompleted(eventData) {
		logSuccess('Updated package ' + chalk.magenta(eventData.package + '@' + eventData.version));
	}

	function onTaskStarted(eventData) {
		var task = eventData.task;
		if (task.displayName) {
			logInfo('Task started: ' + chalk.magenta(task.displayName));
		} else if (Array.isArray(task)) {
			logInfo('Task group started');
		}
	}

	function onTaskFailed(eventData) {
		var task = eventData.task;
		if (task.displayName) {
			logError('Task failed: ' + chalk.magenta(task.displayName) + ' (' + prettyMs(eventData.elapsed) + ')');
		} else if (Array.isArray(task)) {
			logError('Task group failed (' + prettyMs(eventData.elapsed) + ')');
		}
	}

	function onTaskCompleted(eventData) {
		var task = eventData.task;
		if (task.displayName) {
			logSuccess('Task completed: ' + chalk.magenta(task.displayName) + ' (' + prettyMs(eventData.elapsed) + ')');
		} else if (Array.isArray(task)) {
			logSuccess('Task group completed (' + prettyMs(eventData.elapsed) + ')');
		}
	}
};
