import { parse } from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { normalizePath, type ResolvedConfig } from 'vite'

function arraify<T>(target: T | T[]): T[] {
  return Array.isArray(target) ? target : [target]
}

function getEnvFilesForMode(mode: string, envDir: string): string[] {
  return [
    /** default file */ `.env`,
    /** local file */ `.env.local`,
    /** mode file */ `.env.${mode}`,
    /** mode local file */ `.env.${mode}.local`,
  ].map((file) => normalizePath(path.join(envDir, file)))
}

function tryStatSync(file: string): fs.Stats | undefined {
  try {
    // The "throwIfNoEntry" is a performance optimization for cases where the file does not exist
    return fs.statSync(file, { throwIfNoEntry: false })
  } catch {
    // Ignore errors
  }
}

export function loadEnv(mode: string, envDir: string, prefixes: string | string[] = 'VITE_'): Record<string, string> {
  prefixes = arraify(prefixes)
  const env: Record<string, string> = {}
  const envFiles = getEnvFilesForMode(mode, envDir)

  const parsed = Object.fromEntries(
    envFiles.flatMap((filePath) => {
      if (!tryStatSync(filePath)?.isFile()) return []

      return Object.entries(parse(fs.readFileSync(filePath)))
    }),
  )

  // only keys that start with prefix are exposed to client
  for (const [key, value] of Object.entries(parsed)) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      env[key] = value
    }
  }

  return env
}

export function resolveEnvFromConfig(config: ResolvedConfig, prereleaseEnv: string) {
  const env = {
    prerelease: {
      ...config.env,
      ...loadEnv(prereleaseEnv, config.envDir, config.envPrefix),
      // define import.meta.env.PRERELEASE
      PRERELEASE: true,
      MODE: prereleaseEnv,
    },
    current: {
      ...config.env,
      ...loadEnv(config.mode, config.envDir, config.envPrefix),
    },
  }

  global.__env__ = env

  return env
}
