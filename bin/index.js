#!/usr/bin/env node

const figlet = require("figlet");
const path = require("path");
const chalk = require("chalk");
const inquirer = require("inquirer");
const gradient = require("gradient-string");
const fs = require("./fs.js");

const simpleGit = require("simple-git");
const ora = require("ora");

const git = simpleGit();

async function Make(lang, name) {
  const language = lang.toLowerCase();
  try {
    const targetDir = path.join(process.cwd(), name);
    const makeTemplate = ora("Initializing project..").start();
    await git
      .clone(
        `https://github.com/myferr/create-guilded-template-${language}.git`,
        targetDir
      )
      .then(() => {
        makeTemplate.succeed("Project successfully initialized.");
      });
    const makeProject = ora("Cleaning up..").start();
    if (fs.fsNoPromises.existsSync(path.join(targetDir, ".git"))) {
      await fs.fsPromises
        .rm(path.join(targetDir, ".git"), { recursive: true, force: true })
        .then(() => {
          makeProject.succeed("Cleaned up project successfully.");
        });
    } else {
      makeProject.succeed(
        "Cleaned up project successfully. (No .git directory located)"
      );
    }

    console.log(
      `\nRun the following commands to start your project\n- ${chalk.bold.cyan(
        `cd ${name}`
      )}\n- ${chalk.bold.cyan(`npm install`)}\n- ${chalk.bold.cyan(
        `npm run dev`
      )}\n`
    );
  } catch (error) {
    console.log(`${chalk.red.bold("An unexpected error occurred.")}\n${error}`);
  }
}
const Welcome = async () => {
  console.log("\n");
  console.log(
    gradient.pastel.multiline(
      figlet.textSync("guild-cli", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
  console.log("\n");
};

class Prompts {
  async ProjectName() {
    await inquirer
      .prompt([
        {
          name: "ProjectName",
          type: "input",
          message: "Project name:",
          default: "guild-cli-app",
        },
      ])
      .then((NameAnswer) => {
        if (!NameAnswer.ProjectName) {
          Get.Library("guild-cli-app");
        } else {
          Get.Language(NameAnswer.ProjectName);
        }
      });
  }
  async Language(projectName) {
    await inquirer
      .prompt([
        {
          name: "ProjectLang",
          message: "What language would you like to use?",
          type: "list",
          choices: ["JavaScript", "TypeScript"],
        },
      ])
      .then((LangAnswer) => {
        Test(projectName, LangAnswer.ProjectLang);
      });
  }
}

const Get = new Prompts();

const ExecutePrompts = async () => {
  await Get.ProjectName();
};

const Test = async (_projectName, _projectLang, _installDeps) => {
  try {
    const projectPath = path.join(process.cwd(), _projectName);

    if (
      (fs.fsNoPromises.existsSync(projectPath) &&
        fs.fsPromises.lstatSync(projectPath).isDirectory()) === true
    ) {
      console.error(
        chalk.red(
          `Error: Directory "${_projectName}" already exists. Please choose a different name or delete the existing directory.`
        )
      );
      process.exit(1);
    } else {
      Make(_projectLang, _projectName, _installDeps);
    }
  } catch (error) {
    console.log(
      `\n${chalk.red.bold(`hmm, something went wrong. Error: \n${error}`)}\n`
    );
    process.exit(1);
  }
};

async function cli() {
  await Welcome();
  ExecutePrompts();
}

cli();
