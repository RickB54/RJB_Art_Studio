// scripts/check-syntax.mjs
// Validates syntax of all .js and .jsx files under src using esbuild
import fs from 'node:fs'
import path from 'node:path'
import { transform } from 'esbuild'

const srcDir = path.resolve('src')

function getFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(getFiles(fullPath))
    } else if (/\.(jsx?)$/.test(entry.name)) {
      results.push(fullPath)
    }
  }
  return results
}

const files = getFiles(srcDir)
let hasError = false

console.log(`\n── Syntax check (${files.length} files under src/) ────`)

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  const ext = path.extname(file).slice(1) // 'js' or 'jsx'
  const loader = ext === 'jsx' ? 'jsx' : 'js'
  try {
    await transform(content, {
      loader,
      sourcefile: file
    })
  } catch (err) {
    hasError = true
    const relPath = path.relative(process.cwd(), file)
    console.error(`  ✗ Syntax error in ${relPath}:`)
    if (err.errors) {
      for (const e of err.errors) {
        console.error(`    ${e.location?.file || relPath}:${e.location?.line || '?'}:${e.location?.column || '?'}: ${e.text}`)
      }
    } else {
      console.error(`    ${err.message}`)
    }
  }
}

if (hasError) {
  console.error('\n✗ Syntax check failed!\n')
  process.exit(1)
} else {
  console.log(`  ✓ All ${files.length} src files passed syntax validation\n`)
}
