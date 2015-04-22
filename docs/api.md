# Skivvy API

Skivvy can be used programatically, as follows:

```javascript
var skivvy = require('skivvy');

var buildTask = require('./skivvy_tasks/build');

var buildConfig = {
	source: 'src',
	destination: 'dist'
};

skivvy.run({ task: buildTask, config: buildConfig }, function(error) {
	if (error) {
		console.error('Build error: ' + error);
	} else {
		console.log('Build completed');
	}
});
```

## API rules

- All API methods are asynchronous
- All API methods specify two arguments:
	- `options`: key/value object containing method arguments
	- `callback`: (optional) Callback to be invoked on success/error
- All API methods return a promise to be settled on success/error

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


## API methods

- [`skivvy.initProject()`](#skivvy.initProject)
- [`skivvy.installPackage()`](#skivvy.installPackage)
- [`skivvy.uninstallPackage()`](#skivvy.uninstallPackage)
- [`skivvy.updatePackage()`](#skivvy.updatePackage)
- [`skivvy.listPackages()`](#skivvy.listPackages)
- [`skivvy.getProjectConfig()`](#skivvy.getProjectConfig)
- [`skivvy.updateProjectConfig()`](#skivvy.updateProjectConfig)
- [`skivvy.getPackageConfig()`](#skivvy.getPackageConfig)
- [`skivvy.updatePackageConfig()`](#skivvy.updatePackageConfig)
- [`skivvy.run()`](#skivvy.run)

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
		"version": "1.0.3",
		"tasks": [
			{
				"name": "test",
				"description": "Run automated tests"
			},
			{
				"name": "compile",
				"description": "Compile JS and CSS"
			}
		]
	},
	{
		"name": "browser-sync",
		"description": "BrowserSync server tasks",
		"version": "1.0.1",
		"tasks": [
			{
				"name": "serve",
				"description": "Launch a server"
			}
		]
	}
]
```

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.getProjectConfig"></a>
### `skivvy.getProjectConfig(options, [callback])`

Get the Skivvy project configuration

**Returns:** `Promise<object>` Current project configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `expand` | `boolean` | No | `false` | Whether to expand placeholder variables |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.updateProjectConfig"></a>
### `skivvy.updateProjectConfig(options, [callback])`

Update the Skivvy project configuration

**Returns:** `Promise<object>` Updated project configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `updates` | `object` | Yes | N/A | Updates to merge into project configuration |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.getPackageConfig"></a>
### `skivvy.getPackageConfig(options, [callback])`

Get a package's configuration

**Returns:** `Promise<object>` Current package configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |
| `expand` | `boolean` | No | `false` | Whether to expand placeholder variables |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.updatePackageConfig"></a>
### `skivvy.updatePackageConfig(options, [callback])`

Update a package's configuration

**Returns:** `Promise<object>` Updated package configuration

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `package` | `string` | Yes | N/A | Package name |
| `updates` | `object` | Yes | N/A | Updates to merge into package configuration |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |


<a name="skivvy.run"></a>
### `skivvy.run(options, [callback])`

Run a task

**Returns:** `Promise<*>` Value returned by the task function

**Options:**

| Param | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `task` | `function` | Yes | N/A | Task to run |
| `config` | `object` | Yes | N/A | Config object to pass to the task |
| `path` | `string` | No | `process.cwd()` | Path to the Skivvy project |
