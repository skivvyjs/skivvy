# Getting started with Skivvy

- [Introduction](00-introduction.md)
- **Adding tasks**
- [Configuring tasks](02-configuring-tasks.md)
- [Running tasks](03-running-tasks.md)
- [Writing your own tasks](04-writing-tasks.md)
- [Creating packages](05-creating-packages.md)

-

# Adding tasks

> Experience level: **Beginner**

Before you can start using your tasks, you need to add them to the current Skivvy project.

Remember that Skivvy tasks come in two flavors: **external tasks** and **local tasks**. The process for adding tasks differs depending on which one we're talking about.


## Adding external tasks

External task packages can be installed into the current project using the `skivvy install` command:

```bash
skivvy install browserify
```

> _This will install the npm module named `skivvy-package-browserify` from the npm registry, and add it to the current project's `devDependencies` field in its `package.json` file._

After running this command, all the tasks defined in the `browserify` package are immediately available for use via `skivvy run [task]`.


### Adding tasks from scoped npm packages

As well as globally-published packages, Skivvy was designed to integrate seamlessly with npm's [scoped packages](https://docs.npmjs.com/misc/scope). For example, your company might have various Skivvy packages that are not for public use and therefore have to be stored as private scoped npm modules.

You can install a scoped Skivvy package as follows:

```bash
skivvy install @my-company/intranet-tools
```

> _This will install the npm module named `@my-company/skivvy-package-intranet-tools` from the npm registry, and add it to the current project's `devDependencies` field in its `package.json` file._



## Adding local tasks

Adding a local task to your project is as simple as creating a new JavaScript file that exports a function via `module.exports`, and saving that file in your `./skivvy_tasks` directory.

The name of the task is taken from the filename: for example, a task located at `./skivvy_tasks/build.js` can be launched by running `skivvy run build` from within the project folder.

Any tasks that are present within a project's local tasks folder will automatically be available to the command-line tool.

Take a look at the section on [writing your own tasks](04-writing-tasks.md) to learn how to write a Skivvy task.

-

**Next up:** [Configuring tasks](02-configuring-tasks.md)
