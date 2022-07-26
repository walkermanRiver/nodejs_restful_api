import express from 'express'
import InvalidParam from './invalid-param.js'
// import auth from './auth/raw-basic-auth.js';
// import auth from './auth/passport-basic-auth.js';
import auth from './auth/auth-factory.js'
import JobManager from './job/job-manager.js'

export default function createApp(storage, logger){
  const log = logger.child({ module: 'create-app' })
  const app = express()

  app.get('/', async (req, res, next) => {
    try{
      res.status(200);
      res.json("hello");
      res.end();
    }catch (error){
      next(error)
    }
  });

  app.use((req, res, next) => {
    const { method, url } = req
    log.info(`${method} ${url}`)
    next()
  })

  // use basic HTTP auth to secure the api
  app.use(auth.getAuth());
  app.use(express.json());

  app.get('/api/v1/jobs', async (req, res, next) => {
    try{
      const jobManagerInstance = new JobManager(req,res,storage, logger);
      await jobManagerInstance.getAll();
    }catch (error){
      next(error)
    }
  });

  app.get('/api/v1/jobs/:id', async (req, res, next) => {
    try {
      const jobManagerInstance = new JobManager(req,res,storage, logger);
      await jobManagerInstance.get();
    } catch (error){
      next(error)
    }
  });

  app.post('/api/v1/jobs', async (req, res, next) => {
    try{
      const jobManagerInstance = new JobManager(req,res,storage, logger);
      await jobManagerInstance.create();
    } catch (error){
      next(error)
    }
  })

  app.delete('/api/v1/jobs', async (req, res, next) => {
    try{
      const jobManagerInstance = new JobManager(req,res,storage,logger);
      await jobManagerInstance.deleteAll();
    } catch (error){
      next(error)
    }
  })

  app.use((error, req, res, next) => {
    const { message } = error
    log.error(message);

    if (error instanceof InvalidParam) {
      res
        .status(400)
        .json(error.message)
        .end()
    } else {
      next(error)
    }
  })

  return app;
}
