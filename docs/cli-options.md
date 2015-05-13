# Command-line options

## Available commands

- [`skivvy init`](#init)
- [`skivvy install`](#install)
- [`skivvy uninstall`](#uninstall)
- [`skivvy update`](#update)
- [`skivvy list`](#list)
- [`skivvy config`](#config)
- [`skivvy run`](#run)

You can run `skivvy` (without any arguments) or `skivvy [command] --help` for help at any point.


<a name="init"></a>
### `skivvy init`

Create a Skivvy project in the current directory

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--path`, `-P` | No | Current path | Path to Skivvy project |


<a name="install"></a>
### `skivvy install <package>, [package...]`

Add packages to the current project (see [adding tasks](guide/01-adding-tasks.md))

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `package` | Yes | N/A | Package(s) to install |
| `--path`, `-P` | No | Current path | Path to Skivvy project |


<a name="uninstall"></a>
### `skivvy uninstall <package>, [package...]`

Remove packages from the current project

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `package` | Yes | N/A | Package(s) to uninstall |
| `--path`, `-P` | No | Current path | Path to Skivvy project |


<a name="update"></a>
### `skivvy update [package...]`

Update package(s) within the current project

If no `package` is specified, all packages will be updated.

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `package` | No | N/A | Package(s) to update |
| `--path`, `-P` | No | Current path | Path to Skivvy project |


<a name="list"></a>
### `skivvy list`

List this project's installed tasks

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--quiet`, `-q` | No | `false` | Non-verbose output |
| `--path`, `-P` | No | Current path | Path to Skivvy project |


<a name="config"></a>
### `skivvy config`

Update project/package/task configuration (see [configuring tasks](guide/02-configuring-tasks.md))

If no `--task`, `--package` or `--env` is specified, the default environment configuration will be updated.

The `--config` option can be used to express complex objects in a number of ways:

- **Dot notation**

	```bash
	skivvy config --config.greeting=Hello --config.user=world
	```

- **JSON objects**

	```bash
	skivvy config --config="{ \"greeting\": \"Hello\", \"user\": \"world\" }"
	```

- **Arrays**

	```bash
	skivvy config --task=greet --config=hello --config=goodbye
	```

- **JSON Arrays**

	```bash
	skivvy config --task=greet --config="[\"hello\", \"goodbye\"]"
	```

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `-c`, `--config` | Yes | N/A | Configuration updates |
| `-t`, `--task` | No | `null` | Task to configure |
| `-T`, `--target` | No | `null` | Target to configure for the specified task |
| `-p`, `--package` | No | `null` | Task package to configure |
| `-e`, `--env` | No | `null` | Environment to configure |
| `--path`, `-P` | No | Current path | Path to Skivvy project |


<a name="run"></a>
### `skivvy run <task> [task...]`

Run task(s) within the current project (see [running tasks](guide/03-running-tasks.md))

By default, the working directory is set to the project path. You can optionally specify a custom working directory by passing the `--cwd` argument, in which case the `--path` argument is relative to the custom working directory.

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `task` | Yes | N/A | Task(s) to run |
| `-c`, `--config` | No |`null` | Task configuration overrides |
| `-e`, `--env` | No | `null` | Environment name |
| `-C`, `--cwd` | No | Current path | Custom working directory |
| `-P`, `--path` | No | Current path | Path to Skivvy project |


