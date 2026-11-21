type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const formatMessage = (level: LogLevel, message: string, meta?: unknown): string => {
  const timestamp = new Date().toISOString()
  let metaString = ''
  if (meta instanceof Error) {
    metaString = ` ${meta.message}\n${meta.stack || ''}`
  } else if (meta !== undefined) {
    metaString = ` ${JSON.stringify(meta)}`
  }
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}\n`
}

export const logger = {
  info: (message: string, meta?: unknown): void => {
    process.stdout.write(formatMessage('info', message, meta))
  },
  warn: (message: string, meta?: unknown): void => {
    process.stdout.write(formatMessage('warn', message, meta))
  },
  error: (message: string, meta?: unknown): void => {
    process.stderr.write(formatMessage('error', message, meta))
  },
  debug: (message: string, meta?: unknown): void => {
    if (process.env.NODE_ENV !== 'production') {
      process.stdout.write(formatMessage('debug', message, meta))
    }
  },
}
