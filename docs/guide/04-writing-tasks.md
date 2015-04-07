# Getting started with Skivvy

- [Introduction](00-introduction.md)
- [Adding tasks](01-adding-tasks.md)
- [Configuring tasks](02-configuring-tasks.md)
- [Running tasks](03-running-tasks.md)
- **Writing your own tasks**
- [Creating packages](05-creating-packages.md)

-

# Writing Skivvy tasks

## Overview
- Under the hood, a task is **just a plain JavaScript function** that takes a single `config` argument.

- The `config` argument is **automatically supplied to the task**. It is a plain JavaScript key/value object containing the task's configuration settings (as seen in [configuring tasks](02-configuring-tasks.md)). Make sure to use this argument to pass in any task options or file paths.

- Skivvy task functions should also have a `description` property. This is used by the `skivvy list` command to display a **user-friendly description** of the task.

## Example: creating a new local task

Save the following file as `skivvy_tasks/greet.js` to create a new local task:

```javascript
module.exports = function(config) {
	console.log('Hello, ' + config.user + '!');
};

module.exports.description = 'Greet the user';
```
> _You can also create tasks using the `skivvy create:task` scaffolder, as discussed in the [adding tasks](01-adding-tasks.md) section._

Now you are able to see the task straight away in the command-line tool:

```bash
skivvy list
```

> _This will output something like the following:_
```
example-app@1.0.0
└─┬ [local tasks]
  └── greet - Greet the user
```

You can also run the newly-created task:

```bash
skivvy greet --config.user="world" # Outputs: "Hello, world!"
```

As you can see, the task is just a plain JavaScript function. This means that you can write your tasks however you want, allowing for any combination of Gulp/Broccoli/Yo/etc within the task. When Skivvy calls the function it automatically passes in a `config` object, according to the rules discussed in the section on [configuring tasks](02-configuring-tasks.md).


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

### Method 3: use `this.async()` within the task

```javascript
module.exports = function(config) {
	var done = this.async();
	console.log('Waiting one second...');
	setTimeout(done, 1000);
};

module.exports.description = 'Wait a second';
```


## Combining existing tasks to form composite tasks

The [Skivvy API](../api.md) makes it easy to compose individual tasks into larger sequences of tasks:

```javascript
var skivvy = require('skivvy');

var build = require('./build');
var deploy = require('./deploy');

module.exports = function(config, callback) {
	// Run the 'build' task
	skivvy.run(build, config, function(error) {
		if (error) {
			callback(error);
			return;
		}
		// Run the 'deploy' task
		skivvy.run(deploy, config, function(error) {
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
var skivvy = require('skivvy');

var build = require('./build');
var deploy = require('./deploy');

module.exports = function(config) {
	// Run the 'build' task
	return skivvy.run(build, config)
		.then(function() {
			// Run the 'deploy' task
			return skivvy.run(deploy, config);
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
