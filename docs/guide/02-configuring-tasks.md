# Getting started with Skivvy

- [Introduction](00-introduction.md)
- [Adding tasks](01-adding-tasks.md)
- **Configuring tasks**
- [Running tasks](03-running-tasks.md)
- [Writing your own tasks](04-writing-tasks.md)
- [Creating packages](05-creating-packages.md)

-

# Configuring tasks

Most tasks need to be given some kind of configuration in order to do anything useful. With Skivvy, task configuration can be set in four places:

- At the **environment** level, via `skivvy config`
- At the **package** level, via `skivvy config --package=[package]`
- At the **task** level, via `skivvy config --task=[task]`
- At **run-time**, via command-line arguments when running the task

We'll deal with run-time configuration overrides in the section that discusses [running tasks](03-running-tasks.md#passing-additional-configuration-via-command-line-arguments). For now, let's concentrate on using the `skivvy config` command to set configuration for environments, packages and tasks.

**Note: in the examples below, "environment" refers to a Skivvy environment, not your shell environment.** A Skivvy environment is a self-contained set of project-level configuration, and does not inherit any variables from your shell environment.


## Setting environment configuration

> Environment configuration variables are **not** passed directly to tasks, however their values can be referenced in **package** configuration, **task** configuration and **run-time** configuration.

Here's how to use the `skivvy config` command to set configuration settings for the default environment:

```bash
skivvy config --config.paths.source=src --config.paths.destination=dest --config.port=8000 --config.debug=true
```
> _Behind the scenes, this updates the project's `skivvy.json` file. See [here](../the-skivvy-json-file.md) for details._

If you ran the command above, the default environment configuration would now look like this:

```json
{
	"paths": {
		"source": "src",
		"destination": "dest"
	},
	"port": 8000,
	"debug": true
}
```

> _As you can see from the output above, the `skivvy config` command handles strings, numbers, booleans and nested objects correctly._

Tasks can be run in different environments to accommodate different build types. You can read more about configuring multiple environments in the section below on [using multiple environments](#using-multiple-environments).


## Setting package configuration

> Package configuration variables are **not** passed directly to tasks, however their values can be referenced in **task** configuration and **run-time** configuration.

> Package configuration can contain references to **environment** configuration variables.

The `skivvy config --package=[package]` command is used to set package-level configuration settings:

```bash
skivvy config --package=browser-sync --config.port=8000 --config.livereload=true
```

If you ran the command above, the `browser-sync` package configuration would now look like this:

```json
{
	"port": 8000,
	"livereload": true
}
```

Package configuration does **not** automatically inherit the environment configuration. If you want to refer to environment configuration settings in your package configuration, you can achieve this by using placeholders in the package configuration, referencing the `environment` placeholder variable:

```bash
skivvy config browser-sync --config.port="<%=environment.port%>" --config.livereload="<%=environment.debug%>"
```


## Setting task configuration

> Task configuration variables **are** passed directly to tasks, however their values can be overridden by **run-time** configuration.

> Task configuration can contain references to **package** and **environment** configuration variables.

### Local tasks

The `skivvy config --task=[task]` command is used to set task-level configuration settings for local tasks:

```bash
skivvy config --task=greet --config.user=Skivvy
```

If you ran the command above, the local `greet` task configuration would now look like this:

```json
{
	"user": "Skivvy"
}
```

### External tasks

The `skivvy config --package=[package] --task=[task]` command is used to set task-level configuration settings for external tasks:

```bash
skivvy config --package=browser-sync --task=serve --config.open=true
```

If you ran the command above, the external `browser-sync` package's `serve` task configuration would now look like this:

```json
{
	"open": true
}
```

Task configuration does **not** automatically inherit package configuration or environment configuration. If you want to refer to package configuration or environment configuration settings in your task configuration, you can achieve this by using placeholders in the package configuration, referencing the `package` and `environment` placeholder variable:

```bash
skivvy config browser-sync --config.port="<%=package.port%>" --config.livereload="<%=package.livereload%>" --config.source="<%=environment.paths.destination%>"
```


## Using placeholders in configuration values

Sometimes you need dynamic values in your configuration settings, in order to avoid repeatedly hard-coding the same value across multiple packages and tasks. The following placeholders are available when setting configuration values:

- When setting **environment** configuration:
	- `project`: contents of `package.json`
- When setting **package** configuration:
	- `project`: contents of `package.json`
	- `environment`: the environment configuration object
- When setting **task-level** configuration:
	- `project`: contents of `package.json`
	- `environment`: the environment configuration object
	- `package`: the package configuration object
- When setting **run-time** configuration via command-line arguments when running a task:
	- `project`: contents of `package.json`
	- `environment`: the environment configuration object
	- `package`: the package configuration object
	- `config`: the task configuration object


#### Example: Referencing `package.json` values with the `project` placeholder

When setting the environment or package configuration, you can reference fields from the project's `package.json` file. It is available under the `project` placeholder variable:

```bash
skivvy config --config.title="<%=project.name%> v<%=project.version%>"
```

For example, in version `1.0.3` of an npm package named `"my-project-name"`, this would be equivalent to the following environment configuration:

```json
{
	"title": "my-project-name v1.0.3"
}
```

#### Example: Referencing environment configuration using the `environment` placeholder

You can reference the environment configuration when setting package configuration values and task configuration values, under the `environment` configuration variable:

```bash
skivvy config --package=browserify --config.source="<%=environment.paths.source%>/**/*.js"
```

For an environment configuration object whose `"paths"` setting was set to `{ "source": "src" }`, this would be equivalent to the following browserify package configuration:

```bash
{
	"source": "src/**/*.js"
}
```

For examples of using placeholders in run-time configuration, see the section on [running tasks](03-running-tasks.md#passing-additional-configuration-via-command-line-arguments).


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


## Configuring multiple task targets

Sometimes you might want to run the same task several different times during the same build, with different configuration each time. This is achievable by defining multiple **target** configurations within the same task.

For example, say you have a generic `copy` task that copies files from one location to another. When building an HTML5 app, you might want to copy an `assets` folder into the output directory, as well as copying an `index.html` file into the output directory. You can use the same `copy` task to perform the copy operation, and tell it to run different targets in order to perform both tasks.

You can add custom task targets by adding a `--target=[target]` flag when setting task configuration:

```bash
skivvy config --task=copy --target=assets --config.source=./assets
skivvy config --task=copy --target=index --config.source=./index.html
```

This would result in the following configuration for the `copy` task:

```json
{
	"targets": {
		"default": {},
		"assets": {
			"source": "./assets"
		},
		"index": {
			"source": "./index.html"
		}
	}
```

...this also works for external tasks:

```bash
skivvy config --package=filesystem --task=copy --target=assets --config.source=./assets
skivvy config --package=filesystem --task=copy --target=index --config.source=./index.html
```

See the section on [running tasks](03-running-tasks.md#running-tasks-with-different-targets) to see how to run tasks with a different target.


### Specifying the default target for a task

All tasks have a target named `"default"`, whose configuration will be used if the user does not specify a custom target when running the task.

If you would prefer to use a different target as the default, you can pass the target name as the `--config` argument when configuring a task, as follows:

```bash
skivvy config --task=copy --config=assets
```

This will set the `"assets"` target as the default target for the `copy-files` package.

This also works for external tasks:

```bash
skivvy config --package=filesystem --task=copy --config=assets
```


### Specifying multiple default targets for a task

You can configure a task to run multiple targets as the default, by specifying multiple `--config` arguments as follows:

```bash
skivvy config --task=copy --config=assets --config=index
```

This also works for external tasks:

```bash
skivvy config --package=filesystem --task=copy --config=assets --config=index
```


## Hand-editing configuration JSON

While the command-line tool provides a simple means of updating configuration, it might be easier to edit your configuration by hand for more complex projects.

All the project's configuration, including all the different environment configurations, are stored in the project's [skivvy.json](../the-skivvy-json-file.md) file.

-

**Next up:** [Running tasks](03-running-tasks.md)
