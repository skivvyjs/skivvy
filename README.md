# Skivvy [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> Lightweight task runner for modular, reusable build systems


## Installation

Install Skivvy globally:

```bash
npm install -g skivvy
```

This will make the `skivvy` command globally available. See the list of [available commands](#available-commands).


## The Skivvy workflow

There are 4 steps in the Skivvy workflow:

1. Initialize a project: `skivvy init`
2. Install packages: `skivvy install [package]`
3. Configure packages: `skivvy config [package]`
4. Run tasks from the installed packages: `skivvy run [task]`

...all without having to write a single line of code.


## Why Skivvy?

Anybody who's spent a decent amount of time with Gulpfiles and Gruntfiles knows that they start off small, but soon spiral into an unmanageable mess. Skivvy brings order to this chaos by introducing a modular, package-based approach to managing and running tasks, eliminating the need for Gulpfiles/Gruntfiles/etc in the process. Here's how it works:

- Off-the-shelf task packages can be installed alongside your project-specific tasks
- All tasks are automagically accessible from the command-line, with no plumbing code needed
- Tasks can be configured via the command-line tool, or by hand-editing JSON if preferred
- Custom tasks can easily be packaged into modules and shared across multiple projects

Skivvy's package-based methodology means that all the heavy lifting is handled by helper packages whose internals are completely isolated from the main application – kind of like [Docker](https://www.docker.com/), but for build systems. Task configuration is loaded automatically, so even a very elaborate task system should only need a small amount of simple code to link packages together – and even this is only necessary once your project reaches a sufficient level of complexity.

Using a modular task system saves a huge amount of developer effort and ensures that your build setup won't sprawl out of control as a project grows over time. In short, Skivvy allows you to spend less time worrying about tooling, and more time coding.


### What can I do with Skivvy?

Skivvy is **a task runner, not a build tool**. In other words, Skivvy provides a way to instantly launch your tasks with the correct configuration, but what you choose to do within the tasks themselves is completely up to you.

You can write tasks that scaffold components, switch branches, bump version numbers, deploy builds, send emails… the sky's the limit. Under the hood, Skivvy tasks are [just plain functions](docs/guide/04-writing-tasks.md), so you're free to implement them however you like. This means that you can write your tasks using [Gulp](http://gulpjs.com/)/[Broccoli](https://github.com/broccolijs/broccoli)/[Yo](https://github.com/yeoman/yo)/etc, even mixing different build tools within the same package if that's what you feel like doing. No more vendor lock-in!

Skivvy is also easy to integrate into existing task runners via its [JavaScript API](docs/api.md), so even if you're not ready to fully switch over just yet, you can still reap the benefits of moving towards a more modular build system.


## Usage instructions: Hello World app

1. Initialize a Skivvy project in a new folder:

	```bash
	mkdir example-app && cd example-app
	skivvy init
	```
	> _Seeing as this directory has not yet been initialized as an npm module, Skivvy will automatically run the `npm init` command and guide you through the process._

2. Add the `hello-world` package to the current project:

	```bash
	skivvy install hello-world
	```

3. List the tasks installed by the `hello-world` package:

	```bash
	skivvy list
	```

	> _This will output something like the following:_
	```
	example-app@1.0.0
	└─┬ hello-world@1.0.0
	  ├── greet - Greet the user
	  └── welcome - Welcome the user
	```
	_This means that within our project we're now able to use the `hello-world:greet` and `hello-world:welcome` tasks, seeing as they were both included in the `hello-world` package._

4. Configure the `hello-world` package:

	```bash
	skivvy config hello-world --config.user=Skivvy
	```
	> _This sets the `user` configuration variable for all tasks within the `hello-world` package_

5. Run the `hello-world:greet` and `hello-world:welcome` tasks:

	```bash
	skivvy run hello-world:greet # Outputs: "Hello, Skivvy!"
	skivvy run hello-world:welcome # Outputs: "Welcome to Skivvy!"
	```

	> _N.B. In the example above, the `hello-world:` package prefix is optional – `skivvy run greet` and `skivvy run welcome` would also work._

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
- `skivvy config` Update the current project configuration (see [configuring tasks](docs/guide/02-configuring-tasks.md#configuring-tasks))
- `skivvy config [package]` Update a package's configuration (see [configuring tasks](docs/guide/02-configuring-tasks.md#configuring-tasks))
- `skivvy run [task]` Run a task within the current project

All additional functionality is provided by the tasks themselves. See the list of [public Skivvy packages](docs/public-packages.md) for some common pre-packaged build tasks.
