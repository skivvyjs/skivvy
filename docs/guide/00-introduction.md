# Getting started with Skivvy

- **Introduction**
- [Adding tasks](01-adding-tasks.md)
- [Configuring tasks](02-configuring-tasks.md)
- [Running tasks](03-running-tasks.md)
- [Writing your own tasks](04-writing-tasks.md)
- [Creating packages](05-creating-packages.md)

-

# Introduction

This guide is all you need to master Skivvy. By the end of it you'll know how to add, configure and run tasks, write custom tasks, and even publish your own packages.

---

###IMPORTANT BACKGROUND KNOWLEDGE

Before we start, it's important to know that Skivvy tasks come in two flavors: **external tasks** and **local tasks**. These terms will be used throughout the guide, so it's probably best to get used to them now.

- **External tasks**
	- Installed in **packages** (as dependencies of the current project)
	- Contain generic, reusable behavior
	- Can be shared across multiple projects
	- Read-only
- **Local tasks**
	- Created as`.js` files within the current project
	- Contain custom, project-specific behavior
	- Cannot be shared across multiple projects
	- Can be edited in-situ

---

Now we've got that covered, let's get started!

First of all, you'll need to set up a new Skivvy project. To do that, create a new folder and run the `skivvy init` command inside it:

```bash
mkdir skivvy-guide && cd skivvy-guide
skivvy init
```
> _Seeing as this directory has not yet been initialized as an npm module, Skivvy will automatically run the `npm init` command and guide you through the process._

> _Behind the scenes, the `skivvy init` command creates a file in the project root named `skivvy.json`. This is used to store the project and task configuration._

That's all it takes to set up a Skivvy project. Time to add some tasks!

-

**Next up:** [Adding tasks](01-adding-tasks.md)
