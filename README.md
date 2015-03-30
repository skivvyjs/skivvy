# Skivvy [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> Lightweight tool for modular, reusable build tasks


## Installation

Install Skivvy globally:

```bash
npm install -g skivvy
```

This will make the `skivvy` command globally available. See the list of [available tasks](#available-tasks) below.


## Why Skivvy?

- Skivvy provides a simple CLI tool that **eliminates the need for Gulpfiles/Gruntfiles/Makefiles**.
- Build tasks are **packaged into modules** called Skivvy packages – these can either be installed from the public npm registry or developed locally within the project. As soon as a package is added, its tasks are immediately available to the project.
- Skivvy is **framework-agnostic**, allowing you to write your tasks using any combination of [Gulp](http://gulpjs.com/)/[Grunt](http://gruntjs.com/)/Node/etc, without the fear of getting locked into a plugin ecosystem.


## How it works

There are 3 steps in the Skivvy workflow:

1. Initialize a Skivvy project: `skivvy init`
2. Install Skivvy packages: `skivvy install [package]`
3. Run tasks from the installed Skivvy packages: `skivvy [task]`

...all without having to write a single line of JavaScript.


### How does Skivvy differ from other task runners (e.g. Gulp)?

Projects that use Gulp require you to write a project-specific Gulpfile, where you first have to manually `require()` your Gulp plugins, and then write custom code to configure those tasks. This process is fairly trivial for a project that only contains a couple of tasks, but as the project grows, the Gulpfile can easily sprawl into hundreds of lines of hard-to-maintain code.

Skivvy, on the other hand, is much simpler. The lightweight CLI tool automatically loads tasks from any Skivvy packages that have been installed within the current Skivvy project, as well as automatically loading any relevant configuration for those tasks. This eliminates the need for a Gulpfile: the build system is now abstracted into reusable modules that can be seamlessly dropped into other projects.

In practice, this allows you to take a [Docker](https://www.docker.com/)-like approach to creating a build system, where all the inner workings of the helper modules are completely isolated from the main application. This allows you to spend less time worrying about tooling, and more time coding.


## Usage instructions: Hello World app

1. Initialize a Skivvy project in a new folder:

    ```bash
    mkdir example-app && cd example-app
    skivvy init
    ```

2. Add the `hello` Skivvy package to the current project:

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


## Available tasks

- `skivvy init` create a Skivvy project in the current directory
- `skivvy install [package]` Add a Skivvy package to the current project
- `skivvy uninstall [package]` Remove a Skivvy package from the current project
- `skivvy list [package]` List this project's packages and tasks
- `skivvy [task]` Run a task within the current project

All additional functionality is provided by Skivvy packages. See the list of [existing Skivvy packages](#).


## Adding Skivvy packages to a Skivvy project

Skivvy packages contain **tasks**, which are invoked from the command line using `skivvy [task]`. Multiple Skivvy packages can be installed into a single Skivvy project, extending the Skivvy project in a modular fashion.

Skivvy packages come in two flavors: **external packages**, which have been published to the npm registry, and **local packages**, which exist as source files within the current project.


### Adding an external Skivvy package

Skivvy packages can be installed via npm using the `skivvy install` command, as follows:

```bash
skivvy install my-custom-package
```

> _This will install the npm module named `skivvy-my-custom-package` from the npm registry, and add it to the current project's `devDependencies` field in its `package.json` file._

After running this command, any tasks defined in `my-custom-package` will automatically be available to the `skivvy` command-line tool when it is run from within this Skivvy project.


### Adding a local Skivvy package

Project-specific Skivvy packages can be placed in the project's local Skivvy packages directory (`skivvy` by default, see below for instructions on how to change this).

Local Skivvy packages use exactly the same structure as external Skivvy packages. If any Skivvy packages are present within a Skivvy project's local package folder, their tasks will be automatically loaded by the CLI tool in addition to any external packages.


## Running Skivvy tasks

To run a Skivvy task, use the `skivvy [task]` command as follows:

```bash
skivvy my-custom-task
```

This will search the installed Skivvy packages for a task named `my-custom-task`, and run that task if it finds a match.

If multiple tasks across different packages are registered with the same name, Skivvy will prompt the user to determine which task should be run.

Alternatively, the task name can be prefixed with the package name followed by a colon to prevent collisions:

```bash
skivvy my-custom-package:my-custom-task
```

> _The top-level tasks `init`, `install`, `uninstall` and `list` always take priority over tasks defined with the same name in other packages. The only way to run a task named `init`, `install`, `uninstall` or `list` from another Skivvy package is via this colon-prefixed syntax._


### Passing custom configuration variables to Skivvy tasks (TODO)


#### Setting project configuration via the `skivvy.json` file (TODO)


#### Passing configuration via environment variables (TODO)


#### Passing configuration via command-line flags (TODO)


## Writing custom Skivvy packages (TODO)

Under the hood, a Skivvy package exposes all its tasks as plain JavaScript functions. This means that you can use any combination of Gulp/Grunt/etc within a Skivvy project, even mixing multiple task runners in the same Skivvy package.


### Skivvy package folder structure (TODO)


### Skivvy package manifest file (TODO)
