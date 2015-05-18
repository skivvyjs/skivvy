# The `.skivvyrc` file

When a Skivvy project is initialized via `skivvy init`, a file named `.skivvyrc` is created in the project root. This contains configuration settings for the Skivvy task runner, as well as for the tasks themselves.

This file can be edited manually or updated via the `skivvy config` command.


## Example `.skivvyrc` file

```json
{
	"include": "skivvy/tasks",
	"environment": {
		"default": {
			"src": "src",
			"test": "test",
			"docs": "docs",
			"dest": "dist/build-dev",
			"index": "index.dev.html",
			"port": 8000,
			"debug": true
		},
		"production": {
			"src": "src",
			"test": "test",
			"docs": "docs",
			"dest": "dist/build-prod",
			"index": "index.min.html",
			"port": 80,
			"debug": false
		}
	},
	"tasks": {
		"create-post": {
			"targets": {
				"default": {
					"author": "<%= project.author %>"
				}
			}
		}
	},
	"packages": {
		"@timkendrick/mocha-stylus-browserify-app": {
			"config": {
				"source": "<%= environment.src %>",
				"test": "<%= environment.test %>",
				"destination": "<%= environment.dest %>",
				"port": "<%= environment.port %>",
				"debug": "<%= environment.debug %>",
				"es6": true
			},
			"tasks": {
				"build": {
					"targets": {
						"default": {
							"scripts": "<%= package.source %>/scripts",
							"styles": "<%= package.source %>/styles"
						}
					}
				}
			}
		},
		"copy": {
			"config": {},
			"tasks": {
				"copy": {
					"targets": {
						"default": [
							"index",
							"assets"
						],
						"index": {
							"source": "<%= environment.src %>/<%= environment.index %>",
							"destination": "<%= environment.dest %>/index.html"
						},
						"assets": {
							"source": "<%= environment.src %>/assets",
							"destination": "<%= environment.dest %>/assets",
							"options": {
								"dot": true
							}
						}
					}
				}
			}
		},
		"serve": {
			"config": {
				"livereload": "<%= environment.debug %>"
			},
			"tasks": {
				"serve": {
					"targets": {
						"default": "app",
						"app": {
							"mount": "<%= environment.dest %>",
							"port": "<%= environment.port %>",
							"livereload": "<%= package.livereload %>"
						},
						"docs": {
							"mount": "<%= environment.docs %>",
							"port": "<%= environment.port + 1 %>",
							"livereload": "<%= package.livereload %>"
						}
					}
				}
			}
		}
	}
}
```

The following options can be set in the `.skivvyrc` file:

### `include` (default: `"skivvy_tasks"`)

The path where local tasks are loaded from, relative to the project root


### `environment` (default: `{}`)

Environment configuration settings, keyed by environment name

The default environment is named `"default"`.


### `tasks` (default: `{}`)

Local task settings, keyed by task name

Each task section has a property named `targets`, which contains settings for the individual task targets.

The default target is named `default`. To run different targets as the default, change the `default` target value to the name of another target (or array of target names).


### `packages` (default: `{}`)

Package configuration settings, keyed by package name

Each package has two properties:

- `config`: general package configuration
- `tasks`: Task settings, keyed by task name

	- Each task section has a property named `targets`, which contains settings for the individual task targets.

		The default target is named `default`. To run different targets as the default, change the `default` target value to the name of another target (or array of target names).

-

See the [Configuring tasks](guide/02-configuring-tasks.md) guide for more information on how to work with environment and package configuration.
