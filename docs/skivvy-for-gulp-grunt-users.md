# Skivvy for gulp/Grunt users

If you're used to gulp or Grunt then you'll have no problem getting up to speed with Skivvy. While these tools all aim to solve similar problems, there are a few key differences which set Skivvy apart:

- **Task runner, not a build tool**: Skivvy is intended to be used for way more than just build scripts. You can use it to speed up all sorts of chores in your day-to-day workflow (scaffolding, version control, bug tracking, etc). What you choose to do inside your tasks is entirely up to you.

- **Portable and unopinionated**: Under the hood, Skivvy tasks are [just plain functions](#guide/04-writing-tasks.md), so you're free to use whichever libraries you like inside your tasks. This means you can carry on writing tasks using [gulp](http://gulpjs.com/)/[Broccoli](https://github.com/broccolijs/broccoli)/[Yo](https://github.com/yeoman/yo)/etc, even mixing multiple build tools within the same project, with no more need to worry about vendor lock-in.

- **Modular architecture**: Skivvy tasks can be bundled into easily-configurable packages for drop-in reuse across different projects. Mixing and matching pre-made task packages allows you to to get your project set up in minutes, rather than days.

- **No more plumbing code**: Anybody who's spent a decent amount of time with gulpfiles/Gruntfiles/etc knows that they start off small, but soon spiral into an unmanageable mess. Skivvy brings order to this chaos by eliminating gulpfiles and Gruntfiles altogether. Skivvy's package-based methodology and automatic loading of task configuration enforce a flexible, modular build setup that doesn't rely on hundreds of lines of messy JavaScript to hold it all together.


## Transitioning from gulp/Grunt/etc to Skivvy

Luckily for gulp users, Skivvy is 100% compatible with all your existing gulp tasks, including the entire gulp plugin ecosystem, so you can just copy all your tasks across into Skivvy tasks: in fact, use of gulp's [vinyl-fs](https://github.com/wearefractal/vinyl-fs) file streams is actively encouraged when writing Skivvy tasks.

Grunt users can launch their existing tasks from within Skivvy using the [Grunt API](http://gruntjs.com/api/grunt), easing the transition from pre-existing Grunt build setups.

Skivvy is also easy to integrate into other task runners via its [JavaScript API](docs/api.md), so even if you're not ready to fully switch over just yet, you can still reap the benefits of moving towards a more modular build system.