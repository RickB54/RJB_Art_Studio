#!/usr/bin/env node
// scripts/check-sizes.mjs
// Fails if any tracked or staged git file exceeds 20 MB.

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

console.log('── Size check (max 20 MB per file) ────')

let failed = false

// 1. Check tracked files
try {
  const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf-8' })
    .split(/\r?\n/)
    .map(f => f.trim())
    .filter(Boolean)

  for (const rel of tracked) {
    const full = path.join(ROOT, rel)
    if (fs.existsSync(full)) {
      const stats = fs.statSync(full)
      if (stats.size > MAX_BYTES) {
        console.error(`  ✗ Tracked file over 20 MB: ${rel} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
        failed = true
      }
    }
  }
} catch (err) {
  console.error('  ✗ Error checking tracked files:', err.message)
  failed = true
}

// 2. Check staged files
try {
  const staged = execSync('git diff --cached --name-only', { cwd: ROOT, encoding: 'utf-8' })
    .split(/\r?\n/)
    .map(f => f.trim())
    .filter(Boolean)

  for (const rel of staged) {
    const full = path.join(ROOT, rel)
    if (fs.existsSync(full)) {
      const stats = fs.statSync(full)
      if (stats.size > MAX_BYTES) {
        console.error(`  ✗ Staged file over 20 MB: ${rel} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
        failed = true
      }
    }
  }
} catch (err) {
  console.error('  ✗ Error checking staged files:', err.message)
  failed = true
}

if (failed) {
  console.error('\n✗ Size check FAILED. Remove or downsize files over 20 MB before committing.\n')
  process.exit(1)
} else {
  console.log('  ✓ All tracked and staged files are under 20 MB\n')
}
