# Getting started with Skivvy

- [Introduction](00-introduction.md)
- [Adding tasks](01-adding-tasks.md)
- **Configuring tasks**
- [Running tasks](03-running-tasks.md)
- [Writing your own tasks](04-writing-tasks.md)
- [Creating packages](05-creating-packages.md)

-

# Configuring tasks

Most tasks need to be given some kind of configuration in order to do anything useful. With Skivvy, task configuration can be set in three places:

- At the **environment** level, via `skivvy config`
- At the **package** level, via `skivvy config [package]`
- At the **task level**, via command-line arguments when running the task

We'll deal with task-level configuration in the section that discusses [running tasks](03-running-tasks.md#passing-additional-configuration-via-command-line-arguments). For now, let's concentrate on environment and packageconfiguration using the `skivvy config` command.

**Note: in the examples below, "environment" refers to a Skivvy environment, not your shell environment.** A Skivvy environment is a self-contained set of project-level configuration that is accessible to all your tasks, and does not inherit any variables from your shell environment.


## Setting environment configuration

Here's how to use the `skivvy config` command to set environment configuration settings:

```bash
skivvy config --config.paths.source=src --config.port=8000 --config.debug=true
```
> _Behind the scenes, this updates the project's `skivvy.json` file. See [here](../the-skivvy-json-file.md) for details._

If you ran the command above, the environment configuration would now look like this:

```json
{
	"paths": {
		"source": "src"
	},
	"port": 8000,
	"debug": true
}
```

> _As you can see from the output above, the `skivvy config` command handles strings, numbers, booleans and nested objects correctly._

Environment configuration is automatically passed to **local tasks** whenever they are run via `skivvy run [task]`.

---

**IMPORTANT:** Environment configuration is **not** automatically passed to **external tasks**. In order to automatically pass configuration to external tasks, you need to update their _package_ configuration.

---

## Setting package configuration

The `skivvy config [package]` command is used to set package-level configuration settings:

```bash
skivvy config browser-sync --config.source=dest --config.options.port=8000 --config.options.watch=true
```

If you ran the command above, the `browser-sync` package configuration would now look like this:

```json
{
	"source": "dest",
	"options": {
		"port": 8000,
		"watch": true
	}
}
```

Package configuration does **not** automatically inherit the environment configuration. If you want to pass environment configuration settings to external tasks, you can achieve this by using placeholders in the packageconfiguration, referencing the `environment` placeholder variable:

```bash
skivvy config browser-sync --config.source="<%=environment.paths.destination%>" --config.options.port="<%=environment.port%>" --config.options.watch="<%=environment.debug%>"
```

## Using placeholders in configuration values

Sometimes you need dynamic values in your configuration settings, in order to avoid repeatedly hard-coding the same value across multiple packages. The following placeholders can be used when setting configuration values:

- **Environment** configuration:
	- `project`: contents of `package.json`
- **Package** configuration
	- `project`: contents of `package.json`
	- `environment`: the environment configuration object
	- `package`: the package module itself. This contains the following:
		-  `package.name`: the package name
		-  `package.description`: human-readable description of the package
		-  `package.tasks`: array of tasks contained in the package
- **Task-level** configuration (via command-line arguments when running a task)
	- `project`: contents of `package.json`
	- `environment`: the environment configuration object
	- `config`: the package configuration object
	- `package`: the containing package module. This contains the following:
		-  `package.name`: the package name
		-  `package.description`: human-readable description of the package
		-  `package.tasks`: array of tasks contained in the package


#### Example: Referencing `package.json` values with the `project` placeholder

When setting the environment or package configuration, you can reference fields from the project's `package.json` file. It is available under the `project` placeholder variable:

```bash
skivvy config --config.title="<%=project.name%> v<%=project.version%>"
```

For example, in version 1.0.3 of an npm package named `"my-project-name"`, this would be translated to the following config object when the task is run:

```json
{
	"title": "my-project-name v1.0.3"
}
```

#### Example: Referencing environment configuration using the `environment` placeholder

You can reference the environment configuration when setting package configuration values, under the `environment` configuration variable:

```bash
skivvy config browserify --config.source="<%=environment.paths.source%>/**/*.js"
```

For an environment configuration object whose `"paths"` setting was set to `{ "source": "src" }`, this would translate to the following config object when a task from the browserify package was run:

```bash
{
	"source": "src/**/*.js"
}
```


## Using multiple environments

Many projects need to run tasks in different environments – for example, the development version might run locally with debugging enabled, while the production version might be deployed remotely as a minified build. This can be achieved by configuring multiple **environments** within the same project.

The examples above all dealt with using the default environment configuration, however Skivvy allows you to add as many different environments as you need for your project. To set a configuration variable for a non-default environment, use the `--env` flag, as follows:


```bash
skivvy config --env=production --config.paths.source=src --config.port=80 --config.debug=false
```

This will give us an environment named `production`, and its configuration will look like this:


```json
{
	"paths": {
		"source": "src"
	},
	"port": 80,
	"debug": false
}
```

When it comes to running a task with `skivvy run [task]`, you can specify the `--env=production` argument to tell Skivvy to use this custom environment.

All the project's configuration, including all the different environment configurations, are stored in the project's [skivvy.json](../the-skivvy-json-file.md) file.

-

**Next up:** [Running tasks](03-running-tasks.md)
