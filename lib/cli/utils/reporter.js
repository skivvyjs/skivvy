'use strict';

var prettyMs = require('pretty-ms');

var events = require('../../events');

module.exports = function(api) {
	addListeners(api);

	return function detach() {
		removeListeners(api);
	};


	function addListeners(api) {
		api.on(events.INIT_PROJECT_STARTED, onInitProjectStarted);
		api.on(events.INIT_PROJECT_FAILED, onInitProjectFailed);
		api.on(events.INIT_PROJECT_COMPLETED, onInitProjectCompleted);
		api.on(events.INIT_PROJECT_NPM_INIT_NEEDED, onInitProjectNpmInitNeeded);

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
		logInfo('Initializing project at ' + formatPath(eventData.path));
	}

	function onInitProjectFailed(eventData) {
		logError('Failed to initialize project at ' + formatPath(eventData.path));
	}

	function onInitProjectCompleted(eventData) {
		logSuccess('Project initialized at ' + formatPath(eventData.path));
	}

	function onInitProjectNpmInitNeeded(eventData) {
		logWarning('No package.json file found at ' + formatPath(eventData.path));
		logInfo('Follow the prompts to initialize a new npm module:');
	}

	function onInstallPackageStarted(eventData) {
		logInfo('Installing package ' + formatPackage(eventData.package));
	}

	function onInstallPackageFailed(eventData) {
		logError('Failed to install package ' + formatPackage(eventData.package));
	}

	function onInstallPackageCompleted(eventData) {
		logSuccess('Installed package ' + formatPackage(eventData.package + '@' + eventData.version));
	}

	function onUninstallPackageStarted(eventData) {
		logInfo('Uninstalling package ' + formatPackage(eventData.package));
	}

	function onUninstallPackageFailed(eventData) {
		logError('Failed to uninstall package ' + formatPackage(eventData.package));
	}

	function onUninstallPackageCompleted(eventData) {
		logSuccess('Uninstalled package ' + formatPackage(eventData.package));
	}

	function onUpdatePackageStarted(eventData) {
		logInfo('Updating package ' + formatPackage(eventData.package));
	}

	function onUpdatePackageFailed(eventData) {
		logError('Failed to update package ' + formatPackage(eventData.package));
	}

	function onUpdatePackageCompleted(eventData) {
		logSuccess('Updated package ' + formatPackage(eventData.package + '@' + eventData.version));
	}

	function onTaskStarted(eventData) {
		var task = eventData.task;
		if (task.displayName) {
			logInfo('Task started: ' + formatTask(task.displayName));
		}
	}

	function onTaskFailed(eventData) {
		var task = eventData.task;
		if (task.displayName) {
			logError('Task failed: ' + formatTask(task.displayName) + ' (' + formatTime(prettyMs(eventData.elapsed)) + ')');
		}
	}

	function onTaskCompleted(eventData) {
		var task = eventData.task;
		if (task.displayName) {
			logSuccess('Task completed: ' + formatTask(task.displayName) + ' (' + formatTime(prettyMs(eventData.elapsed)) + ')');
		}
	}

	function logInfo(message) {
		api.utils.log.info(message);
	}

	function logWarning(message) {
		api.utils.log.warn(message);
	}

	function logError(message) {
		api.utils.log.error(message);
	}

	function logSuccess(message) {
		api.utils.log.success(message);
	}

	function formatPath(path) {
		return api.utils.colors.path(path);
	}

	function formatPackage(packageName) {
		return api.utils.colors.package(packageName);
	}

	function formatTask(taskName) {
		return api.utils.colors.task(taskName);
	}

	function formatTime(time) {
		return api.utils.colors.time(time);
	}
};
