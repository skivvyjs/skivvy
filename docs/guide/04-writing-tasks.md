# Getting started with Skivvy

- [Introduction](00-introduction.md)
- [Adding tasks](01-adding-tasks.md)
- [Running tasks](02-running-tasks.md)
- [Configuring tasks](03-configuring-tasks.md)
- **Writing your own tasks**
- [Creating packages](05-creating-packages.md)

-

# Writing Skivvy tasks

> Experience level: **Intermediate**

While the existing packages are versatile enough to cover a lot of uses cases, sometimes you need to get your hands dirty and write your own specialized tasks. Luckily, it's surprisingly simple.


## Overview

- Under the hood, a task is **just a plain JavaScript function** that takes a single `config` argument.

- The `config` argument is **automatically supplied to the task function** at run-time. It is a plain JavaScript key/value object containing the task's configuration settings, and is used to pass in any task options or file paths.

- Skivvy task functions should also have a `description` property. This is used by the `skivvy list` command to display a **user-friendly description** of the task.

- Skivvy task functions can also have a `defaults` property. This is used to provide **default configuration values** for the `config` argument.

- Skivvy tasks are declared **one task per file**, and must be exported as the file's `module.exports` property.


## Example: creating a new local task

Save the following file as `skivvy_tasks/hello.js` to create a new local task:

```javascript
module.exports = function(config) {
	console.log('Hello, ' + config.user + '!');
};

module.exports.description = 'Greet the user';

module.exports.defaults = {
	user: 'world'
};
```

> _You can also install the [utils](https://www.npmjs.com/package/@skivvy/skivvy-package-utils) package to help with creating tasks, rather than creating them manually_

Now you are able to see the task straight away in the command-line tool:

```bash
skivvy list
```

> _This will output something like the following:_
>
> ```
> example-app@1.0.0
> └─┬ [local tasks]
>   └── hello - Greet the user
> ```
>

You can also run the newly-created task:

```bash
skivvy hello # Outputs: "Hello, world!"
```


### The task `config` object

When Skivvy calls the function it automatically passes in a `config` object as the first argument. The task's default configuration is specified by the task's `defaults` property, which can be overridden according to the rules discussed in the section on [configuring tasks](03-configuring-tasks.md):

```bash
skivvy hello --config.user="Skivvy" # Outputs: "Hello, Skivvy!"
```

The task's `defaults` property can use [placeholders](03-configuring-tasks.md#using-placeholders-in-configuration-values) to reference project/environment/package configuration variables.

## Synchronous vs asynchronous tasks

By default, Skivvy tasks are **synchronous** and return immediately. In order to perform asynchronous operations, use one of the following methods:

### Method 1: add a callback argument to the task

```javascript
module.exports = function(config, callback) {
	console.log('Waiting one second...');
	setTimeout(callback, 1000);
};

module.exports.description = 'Wait a second';
```
> _The callback argument follows the standard Node conventions: you can indicate that the task has failed by calling `callback(error)`, or alternatively call `callback(null, value)` to pass a return value (useful when running tasks via the [Skivvy API](../api.md#skivvy.run))._

### Method 2: return a promise from the task

```javascript
var Promise = require('promise');

module.exports = function(config) {
	return new Promise(function(resolve, reject) {
		console.log('Waiting one second...');
		setTimeout(resolve, 1000);
	});
};

module.exports.description = 'Wait a second';
```
> _You can also indicate that the task has failed by calling `reject(error)`, or alternatively call `resolve(value)` to pass a return value (useful when running tasks via the [Skivvy API](../api.md#skivvy.run))._


### Method 3: return a stream from the task

```javascript
var vinyl = require('vinyl-fs');

module.exports = function(config) {
	var stream = vinyl.src(config.source)
		.pipe(vinyl.dest(config.destination));
	return stream;
};

module.exports.description = 'Copy files';
```


## Combining existing tasks to form composite tasks

Tasks can be combined into a chain to form a **composite task**. Composite tasks offer an easy way to compose indvidual tasks into automated sequences of tasks.


### Combining local tasks to form a composite task

The easiest way to create a chain of tasks is to define your local task as an array of existing task names:

```javascript
module.exports = ['test', 'build'];

module.exports.description = 'Compile the application';
```

In the example above, Skivvy will first run the local `test` task, then once it has successfully completed it will run the local `build` task. Each of the sub-tasks will load their task configuration automatically, according to the rules discussed in the [configuring tasks](03-configuring-tasks.md) section.


### Combining external tasks to form a composite task

External tasks can also be composed into a sequence, as follows:

```javascript
module.exports = [
	{ package: 'browserify', task: 'browserify' },
	{ package: 'copy', task: 'copy', target: 'assets' },
	{ package: 'browser-sync', task: 'serve' }
];

module.exports.description = 'Build and serve the application';
```

Each task will wait for the previous one to complete successfully before continuing.


### Combining local tasks, external tasks and anonymous tasks

Composite tasks can contain a mixture of local tasks, external tasks and anonymous tasks.

An **anonymous task** is a function which takes a `config` argument, and optionally uses one of the methods described in the section on [asynchronous tasks](#synchronous-vs-asynchronous-tasks) to indicate that Skivvy should wait for it to complete before moving onto the next task:

```javascript
module.exports = [
	'test',
	function(config, callback) {
		console.log('Wait a second...');
		setTimeout(callback, 1000);
	},
	{ task: 'build', target: 'client-app' },
	{ package: 'browser-sync', task: 'serve' }
]
```

## Composing more complex task sequences

For more fine-grained control over task sequences, the [Skivvy API](../api.md) makes it easy to compose individual tasks into larger sequences of tasks:

```javascript

module.exports = function(config, callback) {
	// Within a task, the Skivvy API is available as 'this'
	var skivvy = this;

	// Run the 'build' task
	skivvy.run({ task: 'build' }, function(error, result) {
		if (error) {
			callback(error);
			return;
		}

		// Perform some intermediate operation
		console.log('Build completed, about to deploy');

		// Run the 'deploy' task
		skivvy.run({ task: 'deploy', target: 'client-app' }, function(error, result) {
			if (error) {
				callback(error);
				return;
			}

			// Both tasks have completed successfully
			callback(null);
		});
	});
});

module.exports.description = 'Build and deploy';
```

The above example uses Node-style callbacks to handle the asynchronous operations. The API methods also return promises if you prefer to use them:


```javascript
module.exports = function(config) {
	// Get the Skivvy API
	var skivvy = this;

	// Run the 'build' task
	return skivvy.run({ task: 'build' })
		.then(function() {
			// Perform some intermediate operation
			console.log('Build completed, about to deploy');
		})
		.then(function() {
			// Run the 'deploy' task
			return skivvy.run({ task: 'deploy', target: 'client-app' });
		});
	});
});

module.exports.description = 'Build and deploy';
```

See the documentation for the [Skivvy API](../api.md) for more details.


## Publishing tasks for reuse

Skivvy is intended to help create modular build systems that can be reused from project to project.

For this reason, tasks can be grouped together into **packages** and published to npm for reuse in other projects.

--

**Next up:** [Creating packages](05-creating-packages.md)
