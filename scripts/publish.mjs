// scripts/publish.mjs
import { execSync } from 'node:child_process'

function run(cmd, desc) {
  console.log(`\n==> ${desc}...`)
  try {
    execSync(cmd, { stdio: 'inherit' })
  } catch (err) {
    console.error(`[ERROR] Failed at step: ${desc}`)
    process.exit(1)
  }
}

console.log('\n========================================')
console.log('  RJB Art Studio - Publish Workflow')
console.log('========================================\n')

// 1. Pre-push check
console.log('Checking git repository status...')
const status = execSync('git status --porcelain').toString()

// 2. Stage all changes
run('git add -A', 'Staging changes')

// Check tracked files safety
const trackedFiles = execSync('git ls-files').toString()
if (trackedFiles.includes('reference-old-site') || trackedFiles.includes('.tar.gz')) {
  console.error('[SECURITY ERROR] Private files detected in Git tracking. Aborting publish.')
  process.exit(1)
}

// 3. Commit if there are changes
try {
  execSync('git diff --cached --quiet')
  console.log('No new code changes to commit.')
} catch (e) {
  run('git commit -m "Update gallery and site content"', 'Committing changes')
}

// 4. Push to GitHub
run('git push origin main', 'Pushing to GitHub (origin/main)')

// 5. Build production bundle
run('npm run build', 'Building production dist')

// 6. Deploy to Netlify production
run('npx -y netlify deploy --prod --dir=dist', 'Deploying to Netlify Production')

console.log('\n========================================')
console.log('  Publish complete! Your live site is updated.')
console.log('========================================\n')
