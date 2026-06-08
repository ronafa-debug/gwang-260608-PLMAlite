import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { loadEnv, type Plugin } from 'vite'
import { handleDiary } from './handlers/diary.js'
import { handleStorytelling } from './handlers/storytelling.js'

const SERVER_ENV_PREFIXES = ['VITE_', 'OPENAI_', 'SUPABASE_']

function applyServerEnv(mode: string, envDir: string) {
  const root = path.resolve(envDir)
  const env = loadEnv(mode, root, SERVER_ENV_PREFIXES)
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
  }
  if (env.VITE_SUPABASE_URL) process.env.VITE_SUPABASE_URL = env.VITE_SUPABASE_URL
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON body.'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

async function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  handler: (body: never) => Promise<unknown>,
  envMode: string,
  envDir: string,
) {
  applyServerEnv(envMode, envDir)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const body = await readJsonBody(req)
    const result = await handler(body as never)
    sendJson(res, 200, result)
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Request failed',
    })
  }
}

export function apiPlugin(): Plugin {
  return {
    name: 'plma-api',
    configureServer(server) {
      const { mode } = server.config
      const envDir = server.config.envDir || process.cwd()
      applyServerEnv(mode, envDir)

      server.middlewares.use('/api/generate-storytelling', (req, res) => {
        void handleApiRoute(req, res, handleStorytelling, mode, envDir)
      })
      server.middlewares.use('/api/generate-diary', (req, res) => {
        void handleApiRoute(req, res, handleDiary, mode, envDir)
      })
    },
  }
}
