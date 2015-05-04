# Getting started with Skivvy

- [Introduction](00-introduction.md)
- [Adding tasks](01-adding-tasks.md)
- [Configuring tasks](02-configuring-tasks.md)
- **Running tasks**
- [Writing your own tasks](04-writing-tasks.md)
- [Creating packages](05-creating-packages.md)

-

# Running tasks

To run a task, use the `skivvy run [task]` command. For example, to run a task named `serve`, do the following:

```bash
skivvy run serve
```

This will search all the installed packages and local tasks for a task named `serve`, and run that task if it finds a match.


## Passing additional configuration via command-line arguments

You can override configuration settings at runtime, by adding extra `--config.key=value` command-line arguments like this:

```bash
skivvy run serve --config.source="<%=environment.paths.destination%>" --config.port=8000 --config.livereload=true --config.open=false
```

> _As shown here, the `--config` arguments support strings, numbers, booleans and nested objects. They also support placeholders in strings. See the section on [configuring tasks](02-configuring-tasks.md) for instructions on setting configuration values._

## Dealing with naming collisions

There's only one gotcha when it comes to running tasks, and that's what happens when multiple tasks are registered with the same name across different packages. Yep, looks like we've got a potential naming collision on our hands.

If there's more than one match for the specified task name, Skivvy prioritizes tasks in the following order:

1. **Local tasks**: any local tasks present in the `./skivvy_tasks` folder will take priority over tasks defined in external packages.

2. **External tasks**: these are prioritized below local tasks when matching a task name.

	> _External tasks can still be targeted by prefixing them with their package name, as seen below._

To avoid naming collisions when trying to run external tasks, you can prefix the task name with the package name, followed by a double colon:

```bash
# Run the `greet` task from the `hello-world` package:
skivvy run hello-world::greet
```

## Running tasks with different targets

As seen in the section on [configuring tasks](02-configuring-tasks.md#configuring-multiple-task-targets), each task can define multiple target configurations. Tasks usually run in their default target configuration, but you can tell a task to run in a different target configuration by suffixing the task name with a colon followed by the target name.

For example, to run a task named `greet` which specifies a target configuration named `goodbye`, you can tell Skivvy to use the `goodbye` target configuration as follows:

```bash
# Run the `greet` task with the `goodbye` target configuration
skivvy run greet:goodbye
```

This also applies to running package-prefixed tasks:

```bash
# Run the `greet` task from the `hello-world` package with the `goodbye` target configuration
skivvy run hello-world::greet:goodbye
```

-

**Next up:** [Writing your own tasks](04-writing-tasks.md)
