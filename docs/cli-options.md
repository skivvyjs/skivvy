# Command-line options

## Available commands

- [`skivvy init`](#init)
- [`skivvy install`](#install)
- [`skivvy uninstall`](#uninstall)
- [`skivvy update`](#update)
- [`skivvy list`](#list)
- [`skivvy config get`](#config-get)
- [`skivvy config set`](#config-set)
- [`skivvy run`](#run)

You can run `skivvy` (without any arguments) or `skivvy [command] --help` for help at any point.


<a name="init"></a>
### `skivvy init`

Create a Skivvy project in the current directory

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--path`, `-p` | No | Current path | Path to Skivvy project |
| `--verbose`, `-v` | No | `false` | Verbose error output |


<a name="install"></a>
### `skivvy install <package>, [package...]`

Add packages to the current project (see [adding tasks](guide/01-adding-tasks.md))

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `package` | Yes | N/A | Package(s) to install |
| `--path`, `-p` | No | Current path | Path to Skivvy project |
| `--verbose`, `-v` | No | `false` | Verbose error output |


<a name="uninstall"></a>
### `skivvy uninstall <package>, [package...]`

Remove packages from the current project

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `package` | Yes | N/A | Package(s) to uninstall |
| `--path`, `-p` | No | Current path | Path to Skivvy project |
| `--verbose`, `-v` | No | `false` | Verbose error output |


<a name="update"></a>
### `skivvy update [package...]`

Update package(s) within the current project

If `package` is not specified, all packages will be updated.

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `package` | No | N/A | Package(s) to update |
| `--path`, `-p` | No | Current path | Path to Skivvy project |
| `--verbose`, `-v` | No | `false` | Verbose error output |


<a name="list"></a>
### `skivvy list`

List this project's installed tasks

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--quiet`, `-q` | No | `false` | Non-verbose output |
| `--path`, `-p` | No | Current path | Path to Skivvy project |
| `--verbose`, `-v` | No | `false` | Verbose error output |


<a name="config-get"></a>
### `skivvy config get`

View project/package/task configuration (see [configuring tasks](guide/03-configuring-tasks.md))

If no `--task`, `--package` or `--env` is specified, the default environment configuration will be used.

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--task`, `-t` | No | `null` | Task name |
| `--target`, `-T` | No | `null` | Target name for the specified task |
| `--package`, `-P` | No | `null` | Task package |
| `--env`, `-e` | No | `null` | Environment name |
| `--path`, `-p` | No | Current path | Path to Skivvy project |
| `--verbose`, `-v` | No | `false` | Verbose error output |


<a name="config-set"></a>
### `skivvy config set`

Update project/package/task configuration (see [configuring tasks](guide/03-configuring-tasks.md))

If no `--task`, `--package` or `--env` is specified, the default environment configuration will be updated.

The `--config` option can be used to express complex objects in a number of ways:

- **Dot notation**

	```bash
	skivvy config set --config.greeting=Hello --config.user=world
	```

- **JSON objects**

	```bash
	skivvy config set --config="{ \"greeting\": \"Hello\", \"user\": \"world\" }"
	```

- **Arrays**

	```bash
	skivvy config set --task=greet --config=hello --config=goodbye
	```

- **JSON Arrays**

	```bash
	skivvy config set --task=greet --config="[\"hello\", \"goodbye\"]"
	```

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `--config`, `-c` | Yes | N/A | Configuration updates |
| `--task`, `-t` | No | `null` | Task to configure |
| `--target`, `-T` | No | `null` | Target to configure for the specified task |
| `--package`, `-p` | No | `null` | Task package to configure |
| `--env`, `-e` | No | `null` | Environment to configure |
| `--path`, `-p` | No | Current path | Path to Skivvy project |
| `--verbose`, `-v` | No | `false` | Verbose error output |


<a name="run"></a>
### `skivvy run <task> [task...]`

Run task(s) within the current project (see [running tasks](guide/02-running-tasks.md))

By default, the working directory is set to the project path. You can optionally specify a custom working directory by passing the `--cwd` argument, in which case the `--path` argument is relative to the custom working directory.

**Options:**

| Option | Required | Default | Description |
| ------ | -------- | ------- | ----------- |
| `task` | Yes | N/A | Task(s) to run |
| `--config`, `-c` | No |`null` | Task configuration overrides |
| `--env`, `-e` | No | `null` | Environment name |
| `--cwd`, `-C` | No | Current path | Custom working directory |
| `--path`, `-p` | No | Current path | Path to Skivvy project |
| `--verbose`, `-v` | No | `false` | Verbose error output |


