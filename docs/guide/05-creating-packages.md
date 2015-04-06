# Getting started with Skivvy

- [Introduction](00-introduction.md)
- [Adding tasks](01-adding-tasks.md)
- [Configuring tasks](02-configuring-tasks.md)
- [Running tasks](03-running-tasks.md)
- [Writing your own tasks](04-writing-tasks.md)
- **Creating packages**

-

# Creating Skivvy packages

Skivvy packages are freestanding npm modules that contain tasks. Skivvy packages can be installed into any Skivvy project, and are intended to be as generic and configurable as possible.

## Developing a Skivvy package

Let's say we want to create a Skivvy package for developing client-side React apps, called `react-seed`.

To get started, create a new folder and initialise it as an npm module:

```bash
mkdir skivvy-react-seed && cd skivvy-react-seed
npm init
```
> _All Skivvy packages **must** have an npm module name that starts with `skivvy-`._

> _Skivvy packages should also specify `skivvy-package` as a keyword in order for the npm search._

It can be useful to `npm link` the Skivvy package so that you can use it within other projects while the package is still in development:

```bash
npm link
cd ../my-other-project
npm link skivvy-react-seed
skivvy list # Shows the newly-created "react-seed" package
```

Now we're ready to start building the package.

### Skivvy package folder structure

Assuming our React seed app contains three tasks: `test`, `build` and `serve`, its Skivvy package would contain the following files and folders:

```
skivvy-react-seed
 |-package.json
 |-README.md
 |-index.js
 |-tasks/
 |  |-test.js
 |  |-build.js
 |  |-serve.js
 |-src/
```

#### `package.json`

npm module metadata


#### `README.md`

Readme file containing task and configuration information


#### `index.js`

Main JavaScript file that contains the package listing. This should export a `tasks` property that contains the named Skivvy tasks:

```javascript
exports.tasks = {
	'test': require('./tasks/test'),
	'build': require('./tasks/build'),
	'serve': require('./tasks/serve')
};
```


#### `tasks/`

Folder containing the exported tasks in separate files. See the guide section on [writing tasks](04-writing-tasks) to learn how to write your own tasks.


#### `src/`

Folder containing any helper files used by the exported tasks


### Skivvy packages as Skivvy projects

If you want to use Skivvy to help developing your package, there's nothing stopping you from creating a new Skivvy project within the Skivvy package using `skivvy init`.


## Publishing a Skivvy package to npm

Once you're happy with your package, it's time to publish it to the npm repository.

> _Before you publish your package, make sure that the npm package name starts with `skivvy-` and that `skivvy-package` is one of the npm keywords._

To publish your package, run the following command and hope for the best:

```bash
npm publish
```

That's it! Time to sit back and relax, safe in the knowledge that you're an active contributor to the Skivvy universe.

-

Now that you're a Skivvy pro, it's time to get writing your own tasks and packages. These resources should help you get started:

- [The Skivvy API](../api.md)
- [The `skivvy.json` file](../the-skivvy-json-file.md)
- [Public Skivvy packages](../public-skivvy-packages.md)

Good luck Skivvying!
