# Skivvy [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> Lightweight tool for modular, reusable build tasks


## Installation

Install Skivvy globally:

```bash
npm install -g skivvy
```

This will make the `skivvy` command globally available. See the list of [available tasks](#available-tasks) below.


## Why Skivvy?

- Skivvy provides a simple CLI tool that **replaces sprawling, unmanageable Gulpfiles/Gruntfiles/Makefiles**.
- Build tasks are **packaged into modules** called Skivvy packages – these can either be installed from the public npm registry or developed locally within the project. As soon as a package is added, its tasks are immediately available to the project.
- Skivvy is **framework-agnostic**, allowing you to write your tasks using any combination of [Gulp](http://gulpjs.com/)/[Grunt](http://gruntjs.com/)/Node/etc.


## How it works

There are 3 steps in the Skivvy workflow:

1. Initialize a Skivvy project: `skivvy init`
2. Install Skivvy packages: `skivvy install [package]`
3. Run tasks from the installed Skivvy packages: `skivvy [task]`

Within a Skivvy package, all its tasks are exposed to the Skivvy project as plain JavaScript functions. None of the implementation details are exposed outside the Skivvy package.

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


### Passing custom configuration variables to Skivvy packages (TODO)


#### Setting project configuration via the `skivvy.json` file (TODO)


#### Passing configuration via environment variables (TODO)


#### Passing configuration via command-line flags (TODO)


### Preventing naming collisions across multiple packages (TODO)


## Writing custom Skivvy packages (TODO)


### Skivvy package folder structure (TODO)


### Skivvy package manifest file (TODO)
