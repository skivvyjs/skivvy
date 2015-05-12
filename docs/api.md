# Skivvy API

Skivvy can be used programatically, as follows:

```javascript
var skivvy = require('skivvy');

skivvy.run({ task: 'build' }, function(error) {
	if (error) {
		console.error('Build error: ' + error);
	} else {
		console.log('Build completed');
	}
});
```


## API rules

All API methods are either **synchronous**, **asynchronous**, **event dispatcher** or **utility** methods.


### Synchronous API methods

- Specify one argument:
	- `options`: key/value object containing method arguments
- Return immediately with a value


### Asynchronous API methods

- Specify two arguments:
	- `options`: key/value object containing method arguments
	- `callback`: (optional) Callback to be invoked on success/error
- Return a promise to be settled on success/error

	This means you can call the API methods either using Node-style callbacks or using promises:

	```javascript
	// Example using Node-style callback
	api.method(options, function(error, result) {
		if (error) {
			console.error('Called API Method, encountered error:', error);
		} else {
			console.log('Called API Method, returned value:', result);
		}
	});

	// Example using promises:
	api.method(options)
		.then(function(result) {
			console.log('Called API Method, returned value:', result);
		})
		.catch(function(error) {
			console.error('Called API Method, encountered error:', error);
		});
	```


### Event dispatcher methods

- Useful for listening to global Skivvy events


### Utility methods

- Used for debugging and notification purposes
- Located inside the `skivvy.utils` namespace


## API methods

### Synchronous methods

- [`skivvy.getEnvironmentConfig()`](#skivvy.getEnvironmentConfig)
- [`skivvy.getPackageConfig()`](#skivvy.getPackageConfig)
- [`skivvy.getTaskConfig()`](#skivvy.getTaskConfig)


### Asynchronous methods

- [`skivvy.initProject()`](#skivvy.initProject)
- [`skivvy.installPackage()`](#skivvy.installPackage)
- [`skivvy.uninstallPackage()`](#skivvy.uninstallPackage)
- [`skivvy.updatePackage()`](#skivvy.updatePackage)
- [`skivvy.listPackages()`](#skivvy.listPackages)
- [`skivvy.updateEnvironmentConfig()`](#skivvy.updateEnvironmentConfig)
- [`skivvy.updatePackageConfig()`](#skivvy.updatePackageConfig)
- [`skivvy.updateTaskConfig()`](#skivvy.updateTaskConfig)
- [`skivvy.run()`](#skivvy.run)


### Utility methods

- [`skivvy.utils.log()`](#skivvy.utils.log)
- [`skivvy.utils.timer.start()`](#skivvy.utils.timer.start)
- [`skivvy.utils.timer.end()`](#skivvy.utils.timer.end)


### Event dispatcher methods

- [`skivvy.on()`](#skivvy.on)
- [`skivvy.removeListener()`](#skivvy.removeListener)


<a name="skivvy.getEnvironmentConfig"></a>
### `skivvy.getEnvironmentConfig(options)`

Get the Skivvy environment configuration

**Returns:** `object` Environment configuration object

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `expand` | `boolean` | No | `false` | Whether to expand placeholder variables |
| `environment` | `string` | No | `"default"` | Which environment configuration to retrieve |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.getPackageConfig"></a>
### `skivvy.getPackageConfig(options)`

Get a package's configuration

**Returns:** `object` Package configuration object

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |
| `expand` | `boolean` | No | `false` | Whether to expand placeholder variables |
| `environment` | `string` | No | `"default"` | Environment to use when expanding placeholder variables |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.initProject"></a>
### `skivvy.initProject(options, [callback])`

Create a new Skivvy project

**Returns:** `Promise`

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `path` | `string` | No | `process.cwd()` | Path at which to initialize the project |


<a name="skivvy.installPackage"></a>
### `skivvy.installPackage(options, [callback])`

Install a package in a Skivvy project

**Returns:** `Promise<string>` Version number of the installed package

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.uninstallPackage"></a>
### `skivvy.uninstallPackage(options, [callback])`

Uninstall a package from a Skivvy project

**Returns:** `Promise`

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.updatePackage"></a>
### `skivvy.updatePackage(options, [callback])`

Update installed packages

**Returns:** `Promise<string>` Version number of the updated package

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` `array` | No | `null` | Package name(s) to update, or `null` to update all packages |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.listPackages"></a>
### `skivvy.listPackages(options, [callback])`

List the installed packages and tasks

**Returns:** `Promise<Array>` List of package description objects:

```json
[
	{
		"name": "react-seed",
		"description": "React app package",
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
		"name": "browser-sync",
		"description": "BrowserSync server tasks",
		"tasks": {
			"serve": {
				"description": "Launch a server"
			}
		}
	}
]
```

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.updateEnvironmentConfig"></a>
### `skivvy.updateEnvironmentConfig(options, [callback])`

Update the Skivvy project configuration

**Returns:** `Promise<object>` Updated project configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `updates` | `object` | Yes | N/A | Updates to merge into existing environment configuration |
| `environment` | `string` | No | `"default"` | Which environment configuration to update |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.updatePackageConfig"></a>
### `skivvy.updatePackageConfig(options, [callback])`

Update a package's configuration

**Returns:** `Promise<object>` Updated package configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |
| `updates` | `object` | Yes | N/A | Updates to merge into existing package configuration |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.updateTaskConfig"></a>
### `skivvy.updateTaskConfig(options, [callback])`

Update a task's configuration

**Returns:** `Promise<object>` Updated task target configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `task` | `string` | Yes | N/A | Task name |
| `updates` | `object` | Yes | N/A | Updates to merge into existing task configuration |
| `package` | `string` | No | `null` | Task package name, or `null` for local tasks |
| `target` | `string` | No | `"default"` | Target to update |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.run"></a>
### `skivvy.run(options, [callback])`

Run a task

**Returns:** `Promise<*>` Value returned by the task function. If the `task` option is an array of task functions, the promise will be fulfilled with an array of values corresponding to the task functions.

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `task` | `string`,`function`,`array<string|function>` | Yes | N/A | Task name, task function, or array of task names/functions to run in series |
| `package` | `string` | No | `null` | Package name, used to locate the task if `task` is a string |
| `config` | `object` | No | `{}` | Run-time config overrides to merge into the task's config object |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |
| `cwd` | `string` | No | `process.cwd()` | Working directory in which to run the task |


<a name="skivvy.on"></a>
### `skivvy.on(event, listener)`

Register a global event listener.

`event` can take one of the following values, found in the `skivvy.events` namespace:

| Event |
| ----- |
| `skivvy.events.INIT_PROJECT_STARTED` |
| `skivvy.events.INIT_PROJECT_FAILED` |
| `skivvy.events.INIT_PROJECT_COMPLETED` |
| `skivvy.events.INIT_PROJECT_COMPLETED` |
| `skivvy.events.INIT_PROJECT_NPM_INIT_NEEDED` |
| `skivvy.events.INSTALL_PACKAGE_STARTED` |
| `skivvy.events.INSTALL_PACKAGE_FAILED` |
| `skivvy.events.INSTALL_PACKAGE_COMPLETED` |
| `skivvy.events.UNINSTALL_PACKAGE_STARTED` |
| `skivvy.events.UNINSTALL_PACKAGE_FAILED` |
| `skivvy.events.UNINSTALL_PACKAGE_COMPLETED` |
| `skivvy.events.UPDATE_PACKAGE_STARTED` |
| `skivvy.events.UPDATE_PACKAGE_FAILED` |
| `skivvy.events.UPDATE_PACKAGE_COMPLETED` |
| `skivvy.events.UPDATE_ENVIRONMENT_CONFIG_STARTED` |
| `skivvy.events.UPDATE_ENVIRONMENT_CONFIG_FAILED` |
| `skivvy.events.UPDATE_ENVIRONMENT_CONFIG_COMPLETED` |
| `skivvy.events.UPDATE_PACKAGE_CONFIG_STARTED` |
| `skivvy.events.UPDATE_PACKAGE_CONFIG_FAILED` |
| `skivvy.events.UPDATE_PACKAGE_CONFIG_COMPLETED` |
| `skivvy.events.UPDATE_TASK_CONFIG_STARTED` |
| `skivvy.events.UPDATE_TASK_CONFIG_FAILED` |
| `skivvy.events.UPDATE_TASK_CONFIG_COMPLETED` |
| `skivvy.events.TASK_STARTED` |
| `skivvy.events.TASK_FAILED` |
| `skivvy.events.TASK_COMPLETED` |

The `listener` callback expects one argument, which is a key-value object containing any data that is relevant to the event.

**Returns:** N/A

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `event` | `string` | Yes | N/A | Event type (from `skivvy.events`) |
| `listener` | `function` | Yes | N/A | Callback to invoke when event is encountered |


<a name="skivvy.removeListener"></a>
### `skivvy.removeListener(event, listener)`

Remove a listener that has previously been registered using the [`skivvy.on()`](#skivvy.on) method.

**Returns:** N/A

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `event` | `string` | Yes | N/A | Event type (from `skivvy.events`) |
| `listener` | `function` | Yes | N/A | Registered callback |


<a name="skivvy.utils.log"></a>
### `skivvy.utils.log(message, [message2, [message3...]])`

Log a message to the console, prefixed with the current time. Multiple arguments are joined by a space character.

**Returns:** N/A

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `message` | `string` | Yes | N/A | Message to be logged to the console |


<a name="skivvy.utils.timer.start"></a>
### `skivvy.utils.timer.start([label])`

Start timing an event

If the `label` argument is specified, a message will be logged to the console:

- if `label` is a `string`, that label will be included in the console log
- if `label` is `true`, a generic message will be logged to the console.

The timer will stop when [`skivvy.utils.timer.end()`](#skivvy.utils.timer.end) is called with the token that is returned by this method.

**Returns:** `string` Token used to stop the timer

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `label` | `boolean`,`string` | No | N/A | Log a message to the console |


<a name="skivvy.utils.timer.end"></a>
### `skivvy.utils.timer.end(token, [label])`

Stop timing an event

This will stop the timer that corresponds to the `token` that was returned by the [`skivvy.utils.timer.start()`](#skivvy.utils.timer.start) method.

If the `label` argument is specified, a message will be logged to the console:

- if `label` is a `string`, that label will be included in the console log
- if `label` is `true`, a generic message will be logged to the console.

**Returns:** `number` Number of milliseconds that have elapsed since the timer was started

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `token` | `string` | Yes | N/A | Timer identifier token |
| `label` | `string`,`boolean` | No | N/A | Log a message to the console |
