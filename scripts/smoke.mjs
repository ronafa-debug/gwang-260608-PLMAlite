/**
 * Lightweight regression smoke: file presence + TypeScript/Vite production build.
 * Usage: node scripts/smoke.mjs
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const requiredPaths = [
  'src/App.tsx',
  'src/components/store/StorePage.tsx',
  'src/components/store/OrdersPage.tsx',
  'src/components/store/InvoiceView.tsx',
  'src/components/store/CustomProductDialog.tsx',
  'src/components/admin/AdminOrdersPage.tsx',
  'src/lib/storeApi.ts',
  'src/lib/cart.ts',
  'src/types/store.ts',
  'src/components/shared/DemoNotice.tsx',
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/003_auth_user_isolation.sql',
  'supabase/migrations/004_store.sql',
  'supabase/migrations/005_store_print_storage.sql',
  'supabase/migrations/006_store_admin_invoice.sql',
  'supabase/migrations/007_order_cancel_after_admin_confirm.sql',
]

let failed = false

console.log('Smoke: checking required files…')
for (const rel of requiredPaths) {
  const full = path.join(root, rel)
  if (!existsSync(full)) {
    console.error(`  MISSING: ${rel}`)
    failed = true
  } else {
    console.log(`  OK  ${rel}`)
  }
}

if (failed) {
  console.error('\nSmoke failed: missing files.')
  process.exit(1)
}

console.log('\nSmoke: npm run build…')
const build = spawnSync('npm run build', {
  cwd: root,
  stdio: 'inherit',
  shell: true,
})

if (build.status !== 0) {
  console.error('\nSmoke failed: build.')
  process.exit(build.status ?? 1)
}

console.log('\nSmoke passed.')
