# Getting started with Skivvy

- [Introduction](00-introduction.md)
- [Adding tasks](01-adding-tasks.md)
- [Running tasks](02-running-tasks.md)
- [Configuring tasks](03-configuring-tasks.md)
- [Writing your own tasks](04-writing-tasks.md)
- **Creating packages**

-

# Creating Skivvy packages

> Experience level: **Pro**

Skivvy packages are freestanding npm modules that contain tasks. Packages can be installed into any Skivvy project, and can range from very generic (e.g. a wrapper for a build tool) to very specific (e.g. a scaffolding tool for the company website).

## How to create a Skivvy package

### The easy way

Create a new Skivvy project, install the [utils](https://www.npmjs.com/package/@skivvy/skivvy-package-utils) package, and run the `create-package` task:

```bash
mkdir container-project && cd container-project
skivvy init
skivvy install utils
skivvy run create-package
```

The `create-package` task will guide you through the rest of the process.


### The hard way

Let's say we want to create a Skivvy package for developing client-side React apps, called `react-seed`.

To get started, create a new folder and initialize it as an npm module:

```bash
mkdir skivvy-package-react-seed && cd skivvy-package-react-seed
npm init
```
> _All Skivvy packages **must** have an npm module name that starts with `skivvy-package-`._
>
> _Skivvy packages should also specify `skivvy-package` as a keyword in order for the npm search._

Now we're ready to start building the package.


#### Skivvy package folder structure

Assuming our React seed app contains three tasks: `test`, `build` and `serve`, its Skivvy package would contain the following files and folders:

```
skivvy-react-seed
├── package.json
├── README.md
├── index.js
├─┬ lib/
│ └── tasks/
│     ├── test.js
│     ├── build.js
│     └── serve.js
└── test/
```

##### `package.json`

npm module metadata


##### `README.md`

Readme file containing task and configuration information


##### `index.js`

Main JavaScript file that contains the package listing. This should export a `tasks` property that contains the named Skivvy tasks, and optionally a `defaults` property that specifies the default [package configuration](03-configuring-tasks.md#setting-package-configuration):

```javascript
exports.tasks = {
	'test': require('./tasks/test'),
	'build': require('./tasks/build'),
	'serve': require('./tasks/serve')
};

exports.defaults = {
	source: null,
	destination: null,
	options: {
		port: 80,
		debug: false
	}
};
```


##### `lib/`

Folder containing any code used by the exported tasks


##### `lib/tasks/`

Folder containing the exported tasks in separate files. See the guide section on [writing tasks](04-writing-tasks) to learn how to write your own tasks. When developing a package, it's best to make sure its tasks are as configurable as possible, seeing as the package could potentially be used in many different projects.


##### `test/`

Unit tests for the package


## Skivvy packages as Skivvy projects

If you want to use Skivvy to help developing your package, there's nothing stopping you from creating a new Skivvy project **within** your Skivvy package, by running `skivvy init` from inside your package. This will turn the package into a freestanding Skivvy project, which can in turn have its own packages/config/etc (this doesn't affect the containing project at all).


## Testing your package locally

It can be useful to `npm link` the Skivvy package so that you can use it within other projects while the package is still in development:

```bash
cd my-projects/skivvy-package-react-seed
npm link
cd ../my-other-project
npm link @my-namespace/skivvy-package-react-seed
skivvy list # Shows the newly-created "react-seed" package
```

This allows you to use the development version of your package within other projects, without having to publish the package.


## Publishing a Skivvy package

Once you're happy with your package, it's time to think about publishing it to the npm repository.

Before you can publish your package, make sure it complies with these rules:

1. The npm package **must** be [scoped](https://docs.npmjs.com/misc/scope) to your npm namespace (e.g. `@skivvy`)
2. The npm package name **must** start with `skivvy-package-`
	- Example: `@skivvy/skivvy-package-browserify`
3. The npm keywords **should** contain `"skivvy-package"` as one of the keywords

Once you've gone through that checklist, run the following command to publish your package:

```bash
npm publish --access=public
```

That's it! Time to sit back and relax, safe in the knowledge that you're an active contributor to the Skivvy community.

-

Now that you're a Skivvy pro, it's time to get writing your own tasks and packages. These resources should help you get started:

- [The Skivvy API](../api.md)
- [The `.skivvyrc` file](../the-skivvyrc-file.md)
- [Public Skivvy packages](../public-skivvy-packages.md)

Good luck Skivvying!
