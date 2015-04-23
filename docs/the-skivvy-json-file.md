# The `skivvy.json` file

When a Skivvy project is initialized via `skivvy init`, a file named `skivvy.json` is created in the project root. This contains configuration settings for the Skivvy task runner, as well as for the tasks themselves.

This file can be edited manually or updated via the `skivvy config` command.


## Example `skivvy.json` file

```json
{
	"include": "skivvy/tasks",
	"environment": {
		"default": {
			"paths": {
				"source": "src",
				"destination": "build-dev"
			},
			"port": 8000,
			"debug": true
		},
		"production": {
			"paths": {
				"source": "src",
				"destination": "build-prod"
			},
			"port": 80,
			"debug": false
		}
	},
	"packages": {
		"browserify": {
			"source": "<%= environment.paths.source %>/**/*.js",
			"destination": "<%= environment.paths.destination %>/js/app.js",
			"options": {
				"debug": "<%= environment.debug %>",
				"banner": "<%= project.name %> - v<%= project.version %>\n"
			}
		},
		"stylus": {
			"source": "<%= environment.paths.source %>/**/*.styl",
			"destination": "<%= environment.paths.destination %>/css/app.css",
			"options": {
				"includeCss": true,
				"compress": "<%= !environment.debug %>",
				"banner": "<%= project.name %> - v<%= project.version %>\n"
			}
		},
		"browser-sync": {
			"root": "<%= environment.paths.destination %>",
			"options": {
				"port": "<%= environment.port %>",
				"hostname": "*",
				"watch": "<%= environment.debug %>",
				"open": true
			}
		}
	}
}
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
