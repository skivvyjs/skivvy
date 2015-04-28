# Getting started with Skivvy

- [Introduction](00-introduction.md)
- **Adding tasks**
- [Configuring tasks](02-configuring-tasks.md)
- [Running tasks](03-running-tasks.md)
- [Writing your own tasks](04-writing-tasks.md)
- [Creating packages](05-creating-packages.md)

-

# Adding tasks


Before you can start using your tasks, you need to add them to the current Skivvy project.

Remember that Skivvy tasks come in two flavors: **external tasks** and **local tasks**. The process for adding tasks differs depending on which one we're talking about.


## Adding external tasks

External task packages can be installed into the current project using the `skivvy install` command:

```bash
skivvy install hello-world
```

> _This will install the npm module named `skivvy-package-hello-world` from the npm registry, and add it to the current project's `devDependencies` field in its `package.json` file._

After running this command, all the tasks defined in `hello-world` are immediately available for use via `skivvy run [task]`.


## Adding local tasks

Adding a local task is just as simple. Here's how you create a new local task:

```bash
skivvy create:task
```

Skivvy will prompt you for a task name and description for your task, and then you're done!

> _Behind the scenes, this uses the built-in [skivvy-create](https://github.com/timkendrick/skivvy-create) scaffolder to create a new `.js` file in the local tasks folder (`./skivvy_tasks` by default)_

> _If you prefer to enter the task name and description via the command-line, you can pass `--config.name` and `--config.description` arguments_

You should now have a brand new JavaScript task file located in the `./skivvy_tasks` directory. Take a look at the section on [writing your own tasks](04-writing-tasks.md) to learn a bit more about how to make the most out of local Skivvy tasks.

> _N.B. In this example we used the automatic scaffolding tool to create the task file, but any tasks that are present within a project's local tasks folder will automatically be available to the `skivvy` command-line tool._

> _The name of the task is taken from the filename of the `.js` file: for example, a task located at `./skivvy_tasks/build.js` can be launched by running `skivvy build` from within the project folder._

-

**Next up:** [Configuring tasks](02-configuring-tasks.md)
