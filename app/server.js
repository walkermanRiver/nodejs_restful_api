import createApp from './create-app.js'
import BookStorage from './db/in-memory-job-storage.js'
import logger from './util/logger.js'
const log = logger.child({ module: 'server' })

const { PORT = 3000 } = process.env

const storage = new BookStorage()
const app = createApp(storage,logger)

app
  .on('error', ({stack}) => log.error(stack))
  .listen(PORT, () => {
    log.info('Server started on http://%s:%d', 'localhost', PORT)
  })
