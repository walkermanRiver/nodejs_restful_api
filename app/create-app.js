import express from 'express'
import InvalidParam from './invalid-param.js'
import auth from './auth/basic-auth.js';
import create_job from './job/job.js'

export default function createApp(storage){
  const app = express()

  // use basic HTTP auth to secure the api
  app.use(auth.auth);
  app.use(express.json());

  app.get('/api/v1/jobs', async (req, res) => {
    res
      .status(200)
      .json([]);
  });

  // app.post('/api/v1/jobs', express.json())
  app.post('/api/v1/jobs', async (req, res) => {
    const job = create_job(req.body);
    const jobId = await storage.create(job);
    const savedJob = await storage.read(jobId);
    if(job.if_return_location){
      const locationValue = `/api/v1/jobs/${jobId}`;
      res.set({
        location: locationValue
      })
    }

    res.status(job.returned_status_code);

    if(job.if_return_body){
      res.json({id:jobId, ...savedJob})
    }

    res.end();
  })

  app.get('/api/v1/jobs/:id', async (req, res, next) => {
    try {
      const jobId = req.params.id
      const savedJob = await storage.read(jobId);
      let statusCode = 200
      let body = savedJob;
      if(!savedJob){
        statusCode = 404;
        body = {};
      }
      res
        .status(statusCode)
        .json(body)
        .end();
    } catch (error){
      next(error)
    }
  });

  app.use((error, req, res, next) => {
    if (error instanceof InvalidParam) {
      res
        .status(400)
        .set('Content-Type', 'text/plain')
        .send(error.message)
    } else {
      next(error)
    }
  })

  return app;
}
