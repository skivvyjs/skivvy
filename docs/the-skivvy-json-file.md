# The `skivvy.json` file

When a Skivvy project is initialized via `skivvy init`, a file named `skivvy.json` is created in the project root. This contains configuration settings for the Skivvy task runner, as well as for the tasks themselves.

This file can be edited manually or updated via the `skivvy config` command.


## Example `skivvy.json` file

```json
{
	"include": "skivvy/tasks",
	"projectConfig": {
		"paths": {
			"source": "src",
			"destination": "dist"
		},
		"port": 8000,
		"debug": false
	},
	"packageConfig": {
		"browserify": {
			"source": "<%= projectConfig.paths.source %>/**/*.js",
			"destination": "<%= projectConfig.paths.destination %>/js/app.js",
			"options": {
				"debug": "<%= projectConfig.debug %>",
				"banner": "<%= project.name %> - v<%= project.version %>\n"
			}
		},
		"stylus": {
			"source": "<%= projectConfig.paths.source %>/**/*.styl",
			"destination": "<%= projectConfig.paths.destination %>/css/app.css",
			"options": {
				"includeCss": true,
				"compress": "<%= !projectConfig.debug %>",
				"banner": "<%= project.name %> - v<%= project.version %>\n"
			}
		},
		"browser-sync": {
			"root": "<%= projectConfig.paths.destination %>",
			"options": {
				"port": "<%= projectConfig.port %>",
				"hostname": "*",
				"watch": "<%= projectConfig.debug %>",
				"open": true
			}
		}
	}
}
```

The following options can be set in the `skivvy.json` file:

### `include` (default: `"skivvy_tasks"`)

The path where local tasks are loaded from, relative to the project root


### `projectConfig` (default: `{}`)

Project-level configuration settings


### `packageConfig` (default: `{}`)

Package-level configuration settings, keyed by package name

-

See the [Configuring tasks](guide/02-configuring-tasks.md) guide for more information on how to work with project-level and package-level configuration.
