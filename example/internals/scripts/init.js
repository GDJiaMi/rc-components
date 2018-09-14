/**
 * 重新设置git和npm
 */
const shell = require('shelljs')
const inquirer = require('inquirer')
const childProcess = require('child_process')

function resetGit(next) {
  shell.rm('-rf', '.git')
  shell.exec('git init')

  inquirer.prompt({
    type: 'input',
    name: 'gitRemote',
    message: 'git remote repository:'
  }).then((ans) => {
    if (ans.gitRemote && ans.gitRemote !== '') {
      shell.exec('git remote add origin ' + ans.gitRemote)
    }
    next()
  })
}

function resetNpm() {
  childProcess.execSync('npm init', {
    stdio: 'inherit'
  })
}

resetGit(resetNpm)