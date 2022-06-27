import express from 'express'
import InvalidParam from './invalid-param.js'
import auth from './auth/basic-auth.js';
import JobManager from './job/job-manager.js'

export default function createApp(storage){
  const app = express()

  // use basic HTTP auth to secure the api
  app.use(auth.auth);
  app.use(express.json());

  app.get('/api/v1/jobs', async (req, res, next) => {
    try{
      const jobManagerInstance = new JobManager(req,res,storage);
      await jobManagerInstance.getAll();
    }catch (error){
      next(error)
    }
  });

  app.get('/api/v1/jobs/:id', async (req, res, next) => {
    try {
      const jobManagerInstance = new JobManager(req,res,storage);
      await jobManagerInstance.get();
    } catch (error){
      next(error)
    }
  });

  app.post('/api/v1/jobs', async (req, res, next) => {
    try{
      const jobManagerInstance = new JobManager(req,res,storage);
      await jobManagerInstance.create();
    } catch (error){
      next(error)
    }
  })

  app.delete('/api/v1/jobs', async (req, res, next) => {
    try{
      const jobManagerInstance = new JobManager(req,res,storage);
      await jobManagerInstance.deleteAll();
    } catch (error){
      next(error)
    }
  })

  app.use((error, req, res, next) => {
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
