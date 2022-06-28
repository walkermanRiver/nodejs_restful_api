import supertest from 'supertest'
import assert from 'assert/strict'
import sinon from 'sinon'
import { NIL } from 'uuid'
import createApp from '../app/create-app.js'
import InMemoryJobStorage from '../app/db/in-memory-job-storage.js'
// import basic_auth from '../app/auth/raw-basic-auth.js';
// import basic_auth from '../app/auth/passport-basic-auth.js';
import basic_auth from '../app/auth/auth-factory.js';
import create_job from '../app/job/job-utility.js'
import { JOB_STATUS_RESULT } from '../app/job/job-constants.js'

describe('App', () => {
    let client
    let storage

    before(() => {
        storage = new InMemoryJobStorage()
        sinon.stub(basic_auth, 'getAuth')
        .callsFake(function(){
          return function(req, res, next) {
            return next();
          }
        });
        const app = createApp(storage)
        client = supertest(app)
    })

    after(() => {
      basic_auth.getAuth.restore();
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
          name: 'defaultJob'
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

        // const returnedJobId = response.body.jobId;
        // eslint-disable-next-line no-unused-vars
        const {jobId, status, jobRequest: {trigger_timestamp, ...jobDetail}} = response.body;
        // const location = `/api/v1/jobs/${returnedJobId}`;
        assert.ok(jobId);
        assert.equal(status, JOB_STATUS_RESULT.SUCCESS);
        assert.deepEqual(jobDetail, expectedReturnedJob);
        assert.equal(response.header.location, undefined);
        // assert.equal(location, response.header.location);
    })

    it('should create a customized job', async () => {
      const inputJob = {
        name: 'customized job',
        trigger:{
          expect_status_code: 200,
          if_return_location: true,
          if_return_body: false,
        },
      };

      const response =
        await client
          .post('/api/v1/jobs')
          // Send a request payload
          .send(inputJob)
          // Check the HTTP status code
          .expect(200);

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
        job_execution_time_second: 20,
        trigger:{
          expect_status_code: 200,
          if_return_location: true,
          if_return_body: false,
        }
      };

      const responseOfCreateJob =
        await client
          .post('/api/v1/jobs')
          // Send a request payload
          .send(job)
          // Check the Content-Type header
          // .expect('Content-Type', /application\/json/)
          // Check the HTTP status code
          .expect(200);

      assert.ok(responseOfCreateJob.header.location);
      const responseOfGetSingleJob = await client.get(responseOfCreateJob.header.location)
          .expect(200)
          .expect('Content-Type', /application\/json/);

      const returnedJob = responseOfGetSingleJob.body;

      assert.equal(returnedJob.status,JOB_STATUS_RESULT.RUNNING);
      assert.ok(returnedJob.jobId);
    })

    it('should return 400 on get single request with invalid id', async () => {
      const response = await client.get('/api/v1/jobs/-1')
          // Check the Content-Type header
          .expect('Content-Type', /application\/json/)
          .expect(400);
      assert.ok(response.body);
    })
})
