# Getting started with Skivvy

- [Introduction](00-introduction.md)
- [Adding tasks](01-adding-tasks.md)
- [Configuring tasks](02-configuring-tasks.md)
- **Running tasks**
- [Writing your own tasks](04-writing-tasks.md)
- [Creating packages](05-creating-packages.md)

-

# Running tasks

To run a task, use the `skivvy [task]` command. For example, to run a task named `serve`, do the following:

```bash
skivvy serve
```

This will search all the installed packages and local tasks for a task named `serve`, and run that task if it finds a match.


## Passing additional configuration via command-line arguments

You can override configuration settings at runtime, by adding extra `--config.key=value` command-line arguments like this:

```bash
skivvy serve --config.source="<%=projectConfig.destination%>" --config.options.port=8000 --config.options.hostname=localhost --config.options.watch=true --config.options.open=false
```

> _As shown here, the `--config` arguments support strings, numbers, booleans and nested objects. They also support placeholders in strings. See the section on [configuring tasks](02-configuring-tasks.md) for instructions on setting configuration values._


## Dealing with naming collisions

There's only one gotcha when it comes to running tasks, and that's what happens when multiple tasks are registered with the same name across different packages. Yep, looks like we've got a potential naming collision on our hands.

If there's more than one match for the specified task name, Skivvy prioritizes tasks in the following order:

1. **Top-level commands**: the top-level commands `init`, `install`, `uninstall`, `list` and `config` take priority over all other tasks defined with the same name.

	> _For this reason, it's best to avoid naming your tasks `init`, `install`, `uninstall`, `list` or `config`._

2. **Local tasks**: any local tasks present in the `./skivvy_tasks` folder will take priority over tasks defined in external packages.

3. **External tasks**: these are given the lowest priority when matching a task name.

	> _External tasks can still be targeted by prefixing them with their package name, as seen below._

To avoid naming collisions when trying to run external tasks, you can prefix the task name with the package name, followed by a colon:

```bash
# Run the `greet` task from the `hello-world` package:
skivvy hello-world:greet
```

That should remove any lingering ambiguity. If it looks like a lot of typing, you'll be pleased to know that Skivvy comes with tab-autocomplete to save those precious seconds.

-

**Next up:** [Writing your own tasks](04-writing-tasks.md)
