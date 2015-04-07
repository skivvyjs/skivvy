# Skivvy [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> Lightweight task runner for modular, reusable build systems


## Installation

Install Skivvy globally:

```bash
npm install -g skivvy
```

This will make the `skivvy` command globally available. See the list of [available commands](#available-commands).

## Why Skivvy?

- **Simplifies your build setup** by allowing you to mix and match easily-configured task packages to suit your project requirements.
- **Saves you time and effort** by automagically exposing your tasks to the command-line, with no need for messy "plumbing" code.
- **Encourages code reuse** by replacing sprawling monolithic build scripts with a collection of small, modular tasks that can be shared across projects.

Skivvy was invented so that you can spend less time worrying about tooling, and more time coding.

## The Skivvy workflow

There are 4 steps in the Skivvy workflow:

1. Initialize a project: `skivvy init`
2. Install packages: `skivvy install [package]`
3. Configure packages: `skivvy config [package]`
4. Run tasks from the installed packages: `skivvy [task]`

Skivvy's package-based methodology encourages users to abstract their tasks into reusable modules that can be shared across many different projects. All the heavy lifting is sandboxed into generic helper packages whose internals remain completely isolated from the main application – kind of like [Docker](https://www.docker.com/), but for build systems. In practice, this saves a lot of developer effort and ensures that your build setup won't sprawl out of control as your codebase grows over time.

One last thing to bear in mind: Skivvy is **a task runner, not a build tool**. In other words, you can do whatever you like inside your tasks, Skivvy just provides a way to launch them in a flash with the correct configuration. This means you're free to use any combination of [Gulp](http://gulpjs.com/)/[Broccoli](https://github.com/broccolijs/broccoli)/[Yo](https://github.com/yeoman/yo)/etc, all in the same project – no more vendor lock-in!


## Usage instructions: Hello World app

1. Initialize a Skivvy project in a new folder:

	```bash
	mkdir example-app && cd example-app
	skivvy init
	```

2. Add the `hello-world` package to the current project:

	```bash
	skivvy install hello-world
	```

3. List the tasks installed by the `hello-world` package:

	```bash
	skivvy list
	```

	> _This will output something like the following:_
	```bash
	example-app@1.0.0
	└─┬ hello-world@1.0.0
	  └── greet - Greet the user
	```
	_This means that within our project we're now able to use the `hello-world:greet` task, seeing as it was included in the `hello-world` package._

4. Configure the `hello-world` package:

	```bash
	skivvy config hello-world --config.user=Skivvy
	```
	> _This sets the `user` configuration variable for all tasks within the `hello-world` package_

5. Run the `hello-world:greet` task:

	```bash
	skivvy hello-world:greet # Outputs: "Hello, Skivvy!"
	```

	> _N.B. In the example above, the `hello-world:` package prefix is optional – `skivvy greet` would also work._


## User guide

Check out the [Getting started with Skivvy](docs/guide/00-introduction.md) guide to get a thorough understand of how Skivvy works. Once you've had a skim through that, you should be all set to dive in.

There are already a bunch of [pre-built packages](docs/public-packages.md) to suit most simple projects. All the same, if you want to go off-piste and roll your own build tasks, luckily that's as easy as writing [a single JavaScript function](docs/guide/04-writing-tasks.md).

Good luck Skivvying!


## Available commands

- `skivvy init` create a Skivvy project in the current directory
- `skivvy install [package]` Add a package to the current project
- `skivvy uninstall [package]` Remove a package from the current project
- `skivvy update` Update all package within the current project
- `skivvy update [package]` Update a package within the current project
- `skivvy list` List this project's installed tasks
- `skivvy config` Update the current project configuration (see [configuring tasks](02-configuring-tasks.md#configuring-tasks))
- `skivvy config [package]` Update a package's configuration (see [configuring tasks](02-configuring-tasks.md#configuring-tasks))
- `skivvy [task]` Run a task within the current project

All additional functionality is provided by the tasks themselves. See the list of [public Skivvy packages](docs/public-packages.md) for some common pre-packaged build tasks.
