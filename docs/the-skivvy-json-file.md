# The `skivvy.json` file

When a Skivvy project is initialized via `skivvy init`, a file named `skivvy.json` is created in the project root. This contains configuration settings for the Skivvy task runner, as well as for the tasks themselves.

This file can be edited manually or updated via the `skivvy config` command.


## Example `skivvy.json` file

```json
// TODO
```

The following options can be set in the `skivvy.json` file:

### `include` (default: `"skivvy_tasks"`)

The path where local tasks are loaded from, relative to the project root


### `environment` (default: `{}`)

Environment configuration settings, keyed by environment name

The default environment is named `"default"`


### `packageConfig` (default: `{}`)

Package configuration settings, keyed by package name

-

See the [Configuring tasks](guide/02-configuring-tasks.md) guide for more information on how to work with environment and package configuration.
