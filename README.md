# Skivvy [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> Lightweight task runner for modular, reusable build systems


## Installation

Install Skivvy globally:

```bash
npm install -g skivvy
```

This will make the `skivvy` command globally available. See the list of [available commands](#available-commands) below.


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


## Why Skivvy?

- Skivvy provides a simple tool that **autoloads tasks and exposes them to the command-line** without you having to write a single line of "plumbing" code.
- Tasks are **packaged into reusable modules** – these can either be installed from the public npm registry or developed locally within the project. As soon as a package is added, its tasks are immediately available to the project.
- Skivvy is **a task runner, not a build tool**. You can write your tasks however you want, Skivvy just provides a means of launching them instantly from the command-line with the correct configuration. This means you're free to use any combination of [Gulp](http://gulpjs.com/)/[Broccoli](https://github.com/broccolijs/broccoli)/[Yo](https://github.com/yeoman/yo)/etc, all in the same project.


## How it works

There are 3 steps in the Skivvy workflow:

1. Initialize a project: `skivvy init`
2. Install packages: `skivvy install [package]`
3. Run tasks from the installed packages: `skivvy [task]`

The`skivvy` CLI tool automatically detects tasks from the packages that have been installed within the current project, as well as automatically loading any project-specific configuration for those tasks. This gives you instant access to your project's tasks, which are abstracted into reusable modules that can be shared across many different projects.

In practice, this allows you to take a [Docker](https://www.docker.com/)-like approach to creating a build system, where all the inner workings of the helper modules are completely isolated from the main application. This allows you to spend less time worrying about tooling, and more time coding.


## Available commands

- `skivvy init` create a Skivvy project in the current directory
- `skivvy install [package]` Add a package to the current project
- `skivvy uninstall [package]` Remove a package from the current project
- `skivvy list` List this project's installed packages and tasks
- `skivvy [task]` Run a task within the current project

All additional functionality is provided by the tasks themselves. See the list of [public Skivvy packages](docs/public-skivvy-packages.md) for some common pre-packaged build tasks.


## Adding tasks to a project

Skivvy tasks come in two flavors: **external tasks**, which come from packages that have been installed as dependencies of the current project, and **local tasks**, which exist as source files within the current project.


### Adding external tasks via npm

Pre-published packages can be installed using the `skivvy install` command:

```bash
skivvy install my-custom-package
```

> _This will install the npm module named `skivvy-my-custom-package` from the npm registry, and add it to the current project's `devDependencies` field in its `package.json` file._

After running this command, any tasks defined in `my-custom-package` will automatically be available to the `skivvy` command-line tool when it is run from within the project.


### Creating project-specific local tasks

Local tasks are placed in the project's local Skivvy tasks directory (`./skivvy_tasks` by default). These are developed in-situ and contain custom behaviour that is not intended to be be reused across different projects.

Any tasks that are present within a project's local tasks folder will automatically be available to the `skivvy` command-line tool. The name of the tasks is taken from the filename of the local task: a task located at `./skivvy_tasks/build.js` can be launched by running `skivvy build` from within the project folder.

See the documentation on [writing Skivvy tasks](docs/writing-skivvy-tasks.md) to learn how to write a task. It's easier than you might think!


## Running tasks

To run a task, use the `skivvy [task]` command as follows:

```bash
skivvy my-custom-task
```

This will search all the installed packages and local tasks for a task named `my-custom-task`, and run that task if it finds a match.


### Avoiding naming conflicts

Multiple tasks can be registered with the same name across different packages. If there is more than one match for the specified task name, Skivvy prioritizes tasks in the following order:

1. **Top-level tasks**: the top-level tasks `init`, `install`, `uninstall` and `list` take priority over all other tasks defined with the same name.

	> _For this reason, it's best to avoid naming your tasks `init`, `install`, `uninstall` or `list`._

2. **Local tasks**: any local tasks present in the `skivvy_tasks/` folder will take priority over tasks defined in external packages.

	> _External tasks can still be targeted by prefixing them with their package name, as seen below._

3. **External tasks**: these are given the lowest priority when matching a task name. To avoid naming conflicts between tasks in different packages, you can prefix the task name with the package name, followed by a colon:

	```bash
	# Run the `start` task from the `hello` package:
	skivvy hello:start
	```


## Configuring tasks

Most tasks need to be given some kind of configuration in order to do anything useful. With Skivvy, task configuration can be set in two places: the project-level `skivvy.json` file, and at runtime via command-line arguments.


### Setting project configuration via the `skivvy.json` file (TODO)


### Overriding configuration for individual packages in the `skivvy.json` file (TODO)


### Passing configuration via command-line arguments (TODO)


## Writing custom tasks and packages

It's easy to write your own Skivvy tasks and bundle them into reusable packages. These resources should help you get started:

- [Writing Skivvy tasks](docs/writing-skivvy-tasks.md)
- [Creating Skivvy packages](docs/creating-skivvy-packages.md)
- [The Skivvy API](docs/api.md)
- [Public Skivvy packages](docs/public-skivvy-packages.md)
