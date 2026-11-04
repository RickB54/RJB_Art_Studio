#!/usr/bin/env node
/**
 * scripts/save.mjs
 * User-only save shortcut: stages all changes, commits if changed, and pushes to GitHub.
 * Usage: npm run save [commit message]
 */
import { execSync } from 'node:child_process'

const args = process.argv.slice(2)
const message = args.length > 0 ? args.join(' ') : 'Save latest changes'

function run(cmd) {
  return execSync(cmd, { stdio: 'inherit', encoding: 'utf-8' })
}

function getOutput(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim()
}

try {
  console.log('── Running syntax check ──')
  run('node scripts/check-syntax.mjs')

  console.log('── Staging all changes ──')
  run('git add -A')

  const status = getOutput('git status --porcelain')
  if (!status) {
    console.log('✓ Working tree is clean. Nothing new to commit.')
  } else {
    console.log(`── Committing changes: "${message}" ──`)
    execSync(`git commit -m ${JSON.stringify(message)}`, { stdio: 'inherit' })
  }

  console.log('── Pushing to GitHub ──')
  run('git push')
  console.log('✓ Successfully saved and pushed to GitHub.')
} catch (err) {
  console.error('Save failed:', err.message)
  process.exit(1)
}
