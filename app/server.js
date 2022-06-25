import createApp from './create-app.js'
import BookStorage from './db/in-memory-job-storage.js'


const { PORT = 3000 } = process.env

const storage = new BookStorage()
const app = createApp(storage)

app
  .on('error', ({stack}) => console.error(stack))
  .listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
  })
