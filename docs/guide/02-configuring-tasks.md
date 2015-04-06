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

- At the **project level**, via `skivvy config`
- At the **package level**, via `skivvy config [package]`
- At the **task level**, via command-line arguments when running the task

We'll deal with task-level configuration in the section that discusses [running tasks](03-running-tasks.md#passing-additional-configuration-via-command-line-arguments). For now, let's concentrate on project-level and package-level configuration using the `skivvy config` command.

## Setting project-level configuration

Here's how to use the `skivvy config` command to set project-level configuration settings:

```bash
skivvy config --config.paths.source=src --config.port=8000 --config.debug=true
```
> _Behind the scenes, this updates the project's `skivvy.json` file. See [here](../the-skivvy-json-file.md) for details._

If you ran the command above, the project-level configuration would now look like this:

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

Project-level configuration is automatically passed to **local tasks** whenever they are run via `skivvy [task]`.

---

**IMPORTANT:** Project-level configuration is **not** automatically passed to **external tasks**. In order to automatically pass configuration to external tasks, you need to update their package-level configuration.

---

## Setting package-level configuration

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

Package-level configuration does **not** automatically inherit the project-level configuration. If you want to pass project-level configuration settings to external tasks, you can achieve this by using placeholders in package-level configuration that reference the project-level `projectConfig` placeholder variable:

```bash
skivvy config browser-sync --config.source="<%=projectConfig.paths.destination%>" --config.options.port="<%=projectConfig.port%>" --config.options.watch="<%=projectConfig.debug%>"
```

## Using placeholders in configuration values

Sometimes you need dynamic values in your configuration settings, to avoid repeatedly hard-coding the same value across multiple packages. The following placeholders can be used when setting configuration values:

- **Project-level** configuration:
	- `project`: contents of `package.json`
- **Package-level** configuration
	- `project`: contents of `package.json`
	- `package`: the package module itself
	- `projectConfig`: the project-level configuration object
- **Task-level** configuration
	- `project`: contents of `package.json`
	- `package`: the containing package module
	- `task`: the task function itself
	- `projectConfig`: the project-level configuration object
	- `packageConfig`: the package-level configuration object


#### Example: Referencing `package.json` values with the `project` placeholder

When setting the project-level or package-level configuration, you can reference fields from the project's `package.json` file. It is available under the `project` placeholder variable:

```bash
skivvy config --config.title="<%=project.name%> v<%=project.version%>"
```

For example, in version 1.0.3 of an npm package named `"my-project-name"`, this would be translated to the following config object when the task is run:

```json
{
	"title": "my-project-name v1.0.3"
}
```

#### Example: Referencing project-level configuration using the `projectConfig` placeholder

You can reference the project-level configuration object when setting package-level configuration values, under the `projectConfig` configuration variable:

```bash
skivvy config browserify --config.source="<%=projectConfig.paths.source%>/**/*.js"
```

For a project-level configuration object whose `"paths"` setting was set to `{ "source": "src" }`, this would translate to the following config object when a task from the browserify package was run:

```bash
{
	"source": "src/**/*.js"
}
```

-

**Next up:** [Running tasks](03-running-tasks.md)
