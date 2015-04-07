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
4. Run tasks from the installed packages: `skivvy [task]`

...all without having to write a single line of code.


## Why Skivvy?

Skivvy was invented so that you can spend less time worrying about tooling, and more time coding.

- **Save time and effort**: simplify your build system by installing easily-configured off-the-shelf task packages alongside your own custom tasks.
- **Run tasks in a flash**: all your tasks are automagically exposed to the command-line, with no plumbing code needed. Say goodbye to those Gulpfiles/Gruntfiles/Cakefiles!
- **Modularise your build scripts**: repackage sprawling, monolithic build scripts into collections of small, modular tasks for reuse in different projects.

Skivvy's package-based methodology means that all the heavy lifting is handled by helper packages whose internals remain completely isolated from the main application – kind of like [Docker](https://www.docker.com/), but for build systems. In practice, this saves a lot of unnecessary developer effort and ensures that your build setup won't sprawl out of control as a project grows over time.


### What can I do with Skivvy?

Skivvy is **a task runner, not a build tool**. In other words, Skivvy provides a way to instantly launch your tasks with the correct configuration, but what you choose to do within the tasks themselves is completely up to you.

You can write tasks that scaffold components, bump version numbers, deploy builds, send emails… a whole lot more than just build scripts. Skivvy tasks are [just plain functions](docs/guide/04-writing-tasks.md), so you're free to implement them however you like. This means that under the hood, you can write tasks using any combination of [Gulp](http://gulpjs.com/)/[Broccoli](https://github.com/broccolijs/broccoli)/[Yo](https://github.com/yeoman/yo)/etc, all within the same package – making vendor lock-in a thing of the past.

Skivvy is also easy to integrate into existing build systems via its [JavaScript API](docs/api.md), so even if you're not ready to fully switch over just yet, you can still reap the benefits of moving towards a more modular build system.


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
	```
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
- `skivvy config` Update the current project configuration (see [configuring tasks](docs/guide/02-configuring-tasks.md#configuring-tasks))
- `skivvy config [package]` Update a package's configuration (see [configuring tasks](docs/guide/02-configuring-tasks.md#configuring-tasks))
- `skivvy [task]` Run a task within the current project

All additional functionality is provided by the tasks themselves. See the list of [public Skivvy packages](docs/public-packages.md) for some common pre-packaged build tasks.
