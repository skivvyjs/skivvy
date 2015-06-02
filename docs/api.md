# Skivvy API
![Stability](https://img.shields.io/badge/stability-unstable-yellow.svg)

Skivvy comes with an API that can be used to control Skivvy programatically. This means you can run tasks, configure tasks, install packages: anything the command-line tool can do, can also be done via the Skivvy API.

## Accessing the API

### Accessing the API from within a Skivvy task

The current Skivvy API instance is automatically passed to tasks as the value of `this`:

```javascript
module.exports = function(config, callback) {
	var api = this;
	return api.run({ task: 'build' }, function(error, result) {
		callback(error, result);
	});
};

module.description = 'API task';
```

### Accessing the API from outside Skivvy tasks

First, install the Skivvy API to your project's npm dependencies:

```bash
npm install skivvy --save-dev
```

...then you can `require` the Skivvy module anywhere within your app, and create a new API instance using the `skivvy.api()` method:

```javascript
var skivvy = require('skivvy');

var api = skivvy.api();

api.run({ task: 'build' }, function(error) {
	if (error) {
		console.error('Build error: ' + error);
	} else {
		console.log('Build completed');
	}
});
```

You can also create new Skivvy projects programmatically using the `skivvy.init()` method:

```javascript
var skivvy = require('skivvy');

skivvy.init({ path: 'my/new/project' }, function(error, api) {
	if (error) {
		console.error('Failed to create project: ' + error);
	} else {
		console.log('Created project');
	}
});
```

## Top-level `skivvy` methods


<a name="skivvy.init"></a>
#### `skivvy.init([options], [callback])`

Create a new Skivvy project

**Returns:** `Promise<Api>` API for the newly-created project

**Options:**

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| `path` | `string` | No | `process.cwd()` | Path at which the Skivvy project will be initialized |
| `callback` | `function` | No | `null` | Callback to be invoked on success/error |


<a name="skivvy.api"></a>
#### `skivvy.api(options)`

Get a Skivvy API instance for an existing Skivvy project

##### Returns:

`Api` An instance of the Skivvy API

##### Options:

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project folder |



## API instance reference


> ### About the API instance methods
> All API instance methods are either **synchronous**, **asynchronous**, **event emitter** or **utility** methods.
>
>
> #### Synchronous API methods
>
> - Specify one argument:
> 	- `options`: key/value object containing method arguments
> - Return immediately with a value
>
>
> #### Asynchronous API methods
>
> - Specify two arguments:
> 	- `options`: key/value object containing method arguments
> 	- `callback`: (optional) Callback to be invoked on success/error
> - Return a promise to be settled on success/error
>
> 	This means you can call the API methods either using Node-style > callbacks or using promises:
>
> 	```javascript
> 	// Example using Node-style callback
> 	api.method(options, function(error, result) {
> 		if (error) {
> 			console.error('Called API Method, encountered error:', error);
> 		} else {
> 			console.log('Called API Method, returned value:', result);
> 		}
> 	});
> 
> 	// Example using promises:
> 	api.method(options)
> 		.then(function(result) {
> 			console.log('Called API Method, returned value:', result);
> 		})
> 		.catch(function(error) {
> 			console.error('Called API Method, encountered error:', error);
> 		});
>	```
>
>
> #### Event emitter methods
>
> - Useful for listening to Skivvy lifecycle events
>
>
> #### Utility methods
>
> - Useful for debugging and notification purposes
> - Located inside the `api.utils` namespace


### Table of contents

#### Properties

- [`api.path`](#api.path)
- [`api.environment`](#api.environment)


#### Synchronous methods

- [`api.getEnvironmentConfig()`](#api.getEnvironmentConfig)
- [`api.getPackageConfig()`](#api.getPackageConfig)
- [`api.getTaskConfig()`](#api.getTaskConfig)


#### Asynchronous methods

- [`api.installPackage()`](#api.installPackage)
- [`api.uninstallPackage()`](#api.uninstallPackage)
- [`api.updatePackage()`](#api.updatePackage)
- [`api.listPackages()`](#api.listPackages)
- [`api.updateEnvironmentConfig()`](#api.updateEnvironmentConfig)
- [`api.updatePackageConfig()`](#api.updatePackageConfig)
- [`api.updateTaskConfig()`](#api.updateTaskConfig)
- [`api.run()`](#api.run)


#### Event emitter methods

- [`api.on()`](#api.on)
- [`api.once()`](#api.once)
- [`api.off()`](#api.off)
- [`api.addListener()`](#api.addListener)
- [`api.removeListener()`](#api.removeListener)
- [`api.removeAllListeners()`](#api.removeAllListeners)
- [`api.listeners()`](#api.listeners)
- [`api.setMaxListeners()`](#api.setMaxListeners)


#### Utility methods

- [`api.utils`](#api.utils) is an instance of the [`skivvy-utils`](https://github.com/skivvyjs/skivvy-utils) package:
	- [`api.utils.log()`](https://github.com/skivvyjs/skivvy-utils#utils.log)
	- [`api.utils.log.debug()`](https://github.com/skivvyjs/skivvy-utils#utils.log.debug)
	- [`api.utils.log.info()`](https://github.com/skivvyjs/skivvy-utils#utils.log.info)
	- [`api.utils.log.warn()`](https://github.com/skivvyjs/skivvy-utils#utils.log.warn)
	- [`api.utils.log.error()`](https://github.com/skivvyjs/skivvy-utils#utils.log.error)
	- [`api.utils.log.success()`](https://github.com/skivvyjs/skivvy-utils#utils.log.success)
	- [`api.utils.colors`](https://github.com/skivvyjs/skivvy-utils#utils.colors)
	- [`api.utils.timer.start()`](https://github.com/skivvyjs/skivvy-utils#utils.timer.start)
	- [`api.utils.timer.end()`](https://github.com/skivvyjs/skivvy-utils#utils.timer.end)

-

<a name="api.getEnvironmentConfig"></a>
### `api.getEnvironmentConfig(options)`

Get the Skivvy environment configuration

**Returns:** `object` Environment configuration object

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `expand` | `boolean` | No | `false` | Whether to expand placeholder variables |
| `environment` | `string` | No | `"default"` | Which environment configuration to retrieve |


<a name="api.getPackageConfig"></a>
### `api.getPackageConfig(options)`

Get a package's configuration

**Returns:** `object` Package configuration object

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |
| `expand` | `boolean` | No | `false` | Whether to expand placeholder variables |
| `environment` | `string` | No | `"default"` | Environment to use when expanding placeholder variables |

-


<a name="api.installPackage"></a>
### `api.installPackage(options, [callback])`

Install a package in a Skivvy project

**Returns:** `Promise<string>` Version number of the installed package

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |


<a name="api.uninstallPackage"></a>
### `api.uninstallPackage(options, [callback])`

Uninstall a package from a Skivvy project

**Returns:** `Promise`

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |


<a name="api.updatePackage"></a>
### `api.updatePackage(options, [callback])`

Update installed packages

**Returns:** `Promise<string>` Version number of the updated package

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name to update |


<a name="api.listPackages"></a>
### `api.listPackages(options, [callback])`

List the installed packages and tasks

**Returns:** `Promise<Array>` List of package description objects:

```json
[
	{
		"name": "react-seed",
		"version": "1.0.1",
		"tasks": {
			"test": {
				"description": "Run automated tests"
			},
			"compile": {
				"description": "Compile JS and CSS"
			}
		}
	},
	{
		"name": "serve",
		"version": "0.1.0",
		"tasks": {
			"serve": {
				"description": "Serve files using Browsersync"
			}
		}
	}
]
```

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `versions` | `boolean` | No | `false` | Whether to include version numbers in package descriptions |



<a name="api.updateEnvironmentConfig"></a>
### `api.updateEnvironmentConfig(options, [callback])`

Update the Skivvy project configuration

**Returns:** `Promise<object>` Updated project configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `updates` | `object` | Yes | N/A | Updates to merge into existing environment configuration |
| `environment` | `string` | No | `"default"` | Which environment configuration to update |


<a name="api.updatePackageConfig"></a>
### `api.updatePackageConfig(options, [callback])`

Update a package's configuration

**Returns:** `Promise<object>` Updated package configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |
| `updates` | `object` | Yes | N/A | Updates to merge into existing package configuration |


<a name="api.updateTaskConfig"></a>
### `api.updateTaskConfig(options, [callback])`

Update a task's configuration

**Returns:** `Promise<object>` Updated task target configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `task` | `string` | Yes | N/A | Task name |
| `updates` | `object` | Yes | N/A | Updates to merge into existing task configuration |
| `package` | `string` | No | `null` | Task package name, or `null` for local tasks |
| `target` | `string` | No | `"default"` | Target to update |


<a name="api.run"></a>
### `api.run(options, [callback])`

Run a task

**Returns:** `Promise<*>` Value returned by the task function. If the `task` option is an array of task functions, the promise will be fulfilled with an array of values corresponding to the task functions.

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `task` | `string`,`function`,`array<string|function>` | Yes | N/A | Task name, task function, or array of task names/functions to run in series |
| `environment` | `string` | No | `"default"` | Config environment in which to run the task |
| `config` | `object` | No | `{}` | Run-time config overrides to merge into the task's config object |

-

<a name="api.on"></a>
### `api.on(event, listener)`

<a name="api.once"></a>
### `api.once(event, listener)`

<a name="api.off"></a>
### `api.off(event, listener)`

<a name="api.addListener"></a>
### `api.addListener(event, listener)`

<a name="api.removeListener"></a>
### `api.removeListener(event, listener)`

<a name="api.removeAllListeners"></a>
### `api.removeAllListeners([event])`

<a name="api.listeners"></a>
### `api.listeners(event)`

<a name="api.setMaxListeners"></a>
### `api.setMaxListeners(n)`

Event emitter methods

The Skivvy API instance implements the `EventEmitter` interface. This allows you to listen to Skivvy lifecycle events as follows:

```javascript
var skivvy = require('skivvy');

var api = skivvy.api();

api.run({ task: 'build' })
	.on(api.events.TASK_STARTED, function(event) {
		console.log('Started task' + event.task.displayName);
	})
	.on(api.events.TASK_COMPLETED, function(event) {
		console.log('Finished task' + event.task.displayName);
	})
	.then(function() {
		console.log('Build completed');
	});
```

All Skivvy events are also redispatched throught the global `skivvy` object, for convenience:

```javascript
var skivvy = require('skivvy');

skivvy.on(skivvy.events.TASK_STARTED, function(event) {
   console.log('Started task: ' + event.task.displayName);
}).on(skivvy.events.TASK_COMPLETED, function(event) {
	console.log('Finished task' + event.task.displayName);
});

var api = skivvy.api();

api.run({ task: 'build' })
	.then(function() {
		console.log('Build completed');
	});
```

All the emitted event types can be found in the `api.events` namespace (these are duplicated in the `skivvy.events` namespace):

| Event |
| ----- |
| `api.events.INIT_PROJECT_STARTED` |
| `api.events.INIT_PROJECT_FAILED` |
| `api.events.INIT_PROJECT_COMPLETED` |
| `api.events.INIT_PROJECT_COMPLETED` |
| `api.events.INIT_PROJECT_NPM_INIT_NEEDED` |
| `api.events.INSTALL_PACKAGE_STARTED` |
| `api.events.INSTALL_PACKAGE_FAILED` |
| `api.events.INSTALL_PACKAGE_COMPLETED` |
| `api.events.UNINSTALL_PACKAGE_STARTED` |
| `api.events.UNINSTALL_PACKAGE_FAILED` |
| `api.events.UNINSTALL_PACKAGE_COMPLETED` |
| `api.events.UPDATE_PACKAGE_STARTED` |
| `api.events.UPDATE_PACKAGE_FAILED` |
| `api.events.UPDATE_PACKAGE_COMPLETED` |
| `api.events.UPDATE_ENVIRONMENT_CONFIG_STARTED` |
| `api.events.UPDATE_ENVIRONMENT_CONFIG_FAILED` |
| `api.events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED` |
| `api.events.UPDATE_PACKAGE_CONFIG_STARTED` |
| `api.events.UPDATE_PACKAGE_CONFIG_FAILED` |
| `api.events.UPDATE_PACKAGE_CONFIG_COMPLETED` |
| `api.events.UPDATE_TASK_CONFIG_STARTED` |
| `api.events.UPDATE_TASK_CONFIG_FAILED` |
| `api.events.UPDATE_TASK_CONFIG_COMPLETED` |
| `api.events.TASK_STARTED` |
| `api.events.TASK_FAILED` |
| `api.events.TASK_COMPLETED` |

-

<a name="api.utils"></a>
### `api.utils`

Instance of the [`skivvy-utils`](https://github.com/skivvyjs/skivvy-utils) package
