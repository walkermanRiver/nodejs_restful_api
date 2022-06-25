import supertest from 'supertest'
import assert from 'assert/strict'
import sinon from 'sinon'
import { NIL } from 'uuid'
import createApp from '../app/create-app.js'
import InMemoryJobStorage from '../app/db/in-memory-job-storage.js'
import basic_auth from '../app/auth/basic-auth.js';
import create_job from '../app/job/job.js'

describe('App', () => {
    let client
    let storage

    before(() => {
        storage = new InMemoryJobStorage()
        sinon.stub(basic_auth, 'auth')
          .callsFake(function(req, res, next) {
              return next();
          });
        const app = createApp(storage)
        client = supertest(app)
    })

    after(() => {
      basic_auth.auth.restore();
    })

    beforeEach(async () => {
        await storage.deleteAll()
    })

    it('should return an empty list for all jobs initially', async () => {
        const response = await client.get('/api/v1/jobs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
        assert.deepEqual(response.body, [])
    })

    it('should create a default job', async () => {
        const inputJob = {
          name: 'calculation'
        };
        const expectedReturnedJob = create_job(inputJob);

        const response =
          await client
            .post('/api/v1/jobs')
            // Send a request payload
            .send(inputJob)
            // Check the Content-Type header
            .expect('Content-Type', /application\/json/)
            // Check the HTTP status code
            .expect(200)

        const returnedJobId = response.body.id;
        // const location = `/api/v1/jobs/${returnedJobId}`;
        assert.ok(returnedJobId);
        // eslint-disable-next-line no-unused-vars
        const {id, trigger_timestamp, ...jobDetail} = response.body;
        assert.deepEqual(jobDetail, expectedReturnedJob);
        assert.equal(response.header.location, undefined);
        // assert.equal(location, response.header.location);
    })

    it('should create a customized job', async () => {
      const inputJob = {
        name: 'calculation',
        type:'defaultType',
        if_return_location: true,
        if_return_body: false,
        returned_status_code: 201,
      };

      const response =
        await client
          .post('/api/v1/jobs')
          // Send a request payload
          .send(inputJob)
          // Check the HTTP status code
          .expect(201);

      assert.ok(response.header.location);
      assert.deepEqual(response.body, {});
    })

    it('should return 404 for a non-existing job', async () => {
      const id = NIL
      const response = await client.get(`/api/v1/jobs/${id}`)
          .expect(404);
      assert.deepEqual(response.body, {})
    })

    it('should get a single job', async () => {
      const job = {
        name: 'planning',
        if_return_location: true
      };

      const responseOfCreateJob =
        await client
          .post('/api/v1/jobs')
          // Send a request payload
          .send(job)
          // Check the Content-Type header
          .expect('Content-Type', /application\/json/)
          // Check the HTTP status code
          .expect(200);

      const responseOfGetSingleJob = await client.get(responseOfCreateJob.header.location)
          .expect(200)
          .expect('Content-Type', /application\/json/);

      const returnedJob = responseOfGetSingleJob.body;
      assert.deepEqual(returnedJob.name, job.name);
    })

    it('should return 400 on get single request with invalid id', async () => {
      const response = await client.get('/api/v1/jobs/-1')
          .expect(400);
      assert.deepEqual(response.body, {})
    })
})
