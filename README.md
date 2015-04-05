# Skivvy [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> Lightweight task runner for modular, reusable build systems


## Installation

Install Skivvy globally:

```bash
npm install -g skivvy
```

This will make the `skivvy` command globally available. See the list of [available commands](#available-commands) below.


## Why Skivvy?

- Skivvy provides a simple tool that **autoloads tasks and exposes them to the command-line** without you having to write a single line of code.
- Tasks are **packaged into reusable modules** – these can either be installed from the public npm registry or developed locally within the project. As soon as a package is added, its tasks are immediately available to the project.
- Skivvy is **a task runner, not a build tool**. You can write your tasks however you want, Skivvy just provides a means of launching them instantly from the command-line. This means you're free to use any combination of [Gulp](http://gulpjs.com/)/[Broccoli](https://github.com/broccolijs/broccoli)/[Yo](https://github.com/yeoman/yo)/etc, all in the same project.


## How it works

There are 3 steps in the Skivvy workflow:

1. Initialize a project: `skivvy init`
2. Install packages: `skivvy install [package]`
3. Run tasks from the installed packages: `skivvy [task]`

The`skivvy` CLI tool automatically detects tasks from the packages that have been installed within the current project, as well as automatically loading any project-specific configuration for those tasks. This gives you instant access to your project's tasks, which are abstracted into reusable modules that can be shared across many different projects.

In practice, this allows you to take a [Docker](https://www.docker.com/)-like approach to creating a build system, where all the inner workings of the helper modules are completely isolated from the main application. This allows you to spend less time worrying about tooling, and more time coding.


## Usage instructions: Hello World app

1. Initialize a Skivvy project in a new folder:

    ```bash
    mkdir example-app && cd example-app
    skivvy init
    ```

2. Add the `hello` package to the current project:

    ```bash
    skivvy install hello
    ```

3. List the tasks installed by the `hello` package:

    ```bash
    skivvy list
    ```

    > _This will output something like the following:_
    ```bash
    example-app@0.0.1
    └─┬ hello@1.0.0
      └── start - Greet the user
    ```
    _This means that within our project we are now able to use the `hello:start` task, as it was included in the `hello` package._

4. Run the `hello:start` task:

    ```bash
    skivvy hello:start # Outputs: "Hello, world!"
    ```
    > _N.B. In the example above, the `hello:` package prefix is optional – `skivvy start` would also work._


## Available commands

- `skivvy init` create a Skivvy project in the current directory
- `skivvy install [package]` Add a package to the current project
- `skivvy uninstall [package]` Remove a package from the current project
- `skivvy list [package]` List this project's installed packages and tasks
- `skivvy [task]` Run a task within the current project

All additional functionality is provided by the tasks themselves. See the list of [existing Skivvy packages](#) for some common pre-made build tasks.


## Adding tasks to a Skivvy project

Skivvy tasks come in two flavors: **external tasks**, which come from packages that are published to the npm registry, and **local tasks**, which exist as source files within the current project.

Once they have been added to the project, external tasks and local tasks are both invoked from the command-line the same way: `skivvy [task]`


### Adding tasks from an external package

Skivvy packages contain tasks. Multiple packages can be installed into a single project, extending the project's build system in a modular fashion.

Skivvy packages can be installed via npm using the `skivvy install` command, as follows:

```bash
skivvy install my-custom-package
```

> _This will install the npm module named `skivvy-my-custom-package` from the npm registry, and add it to the current project's `devDependencies` field in its `package.json` file._

After running this command, any tasks defined in `my-custom-package` will automatically be available to the `skivvy` command-line tool when it is run from within the project.


### Creating project-specific local tasks

Local tasks can be placed in the project's local Skivvy tasks directory (`skivvy_tasks` by default). These are developed in-situ and are intended to contain custom behaviour that cannot be reused across projects.

Any tasks that are present within a project's local tasks folder will automatically be available to the `skivvy` command-line tool when it is run from within the project.

See the section below on [writing custom Skivvy tasks](#writing-custom-skivvy-tasks) to learn how to write a task. It's easier than you might think!


## Running Skivvy tasks

To run a task, use the `skivvy [task]` command as follows:

```bash
skivvy my-custom-task
```

This will search all the installed packages and local tasks for a task named `my-custom-task`, and run that task if it finds a match.


### Preventing naming collisions

If multiple tasks across different packages are registered with the same name, the task name can be prefixed with the package name followed by a colon to avoid naming collisions:

- **External tasks**

	```bash
	# Run `my-custom-task` from the `my-custom-package` package:
	skivvy my-custom-package:my-custom-task
	```

- **Local tasks**

	```bash
	# Run `my-local-task` from the local tasks folder:
	skivvy local:my-local-task
	```

- **Top-level tasks**

	The top-level tasks `init`, `install`, `uninstall` and `list` always take priority over tasks defined with the same name in other packages:
	
	```bash
	# Run the top-level `skivvy install` command:
	skivvy install
	```

	> _This means that the only way to run an external or local task named `init`, `install`, `uninstall` or `list` is via the colon-prefixed syntax._


### Passing custom configuration to Skivvy tasks (TODO)


#### Setting project configuration via the `skivvy.json` file (TODO)


#### Setting package-level configuration in the `skivvy.json` file (TODO)


#### Passing configuration via command-line flags (TODO)


#### Passing configuration via environment variables (TODO)


## Writing custom Skivvy tasks (TODO)

- Under the hood, a Skivvy task is just a plain JavaScript function that takes a single `config` argument. This means that you can write your tasks however you want, allowing for any combination of Gulp/Broccoli/etc within the same Skivvy project.

- The `config` argument is automatically supplied to the task. It is a plain JavaScript object containing all the relevant task configuration, as discussed in [Passing custom configuration to Skivvy tasks](#passing-custom-configuration-to-skivvy-tasks).

- Skivvy task functions can also have a `description` property. This is used by the `skivvy list` command to describe the task in a user-friendly form.

### Example Skivvy task

Save the following file as `skivvy_tasks/greet.js` to create a new local task:

```javascript
module.exports.task = function(config) {
	console.log('Hello, ' + config.user + '!');
};

module.exports.description = 'Greet the user';
```

Now you are able to run the task:

```bash
skivvy greet --config.user="world" # Outputs: "Hello, world!"
```


### Synchronous vs asynchronous tasks (TODO)


#### Asynchronous Skivvy task examples (TODO)


## Creating custom Skivvy packages (TODO)


### Skivvy package folder structure (TODO)


### Skivvy package manifest file (TODO)


### Publishing a Skivvy package to npm (TODO)
