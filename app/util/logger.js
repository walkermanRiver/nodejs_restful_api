import winston from 'winston'
import config from '../config/config.js'

const { createLogger, transports, format } = winston
const { Console } = transports
// const { combine, timestamp, printf, splat, json, prettyPrint } = format
const { combine, timestamp, splat, json, prettyPrint } = format

const logger = createLogger({
  level: config?.server?.log_level ? config?.server?.log_level : 'info',
  format: combine(
    splat(),
    json(),
    timestamp(),
    prettyPrint()
    // printf(({ level, message, timestamp, ...additionalInfo }) => {
    //   return `[${(new Date(timestamp)).toLocaleTimeString()}] [${level}] ${message} ${Object.keys(additionalInfo).length ? JSON.stringify(additionalInfo) : ''}`
    // })
  ),
  transports: [
    new Console()
  ]
})

export default logger
