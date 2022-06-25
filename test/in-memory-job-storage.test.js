import assert from 'assert/strict'
import { NIL } from 'uuid'
import InMemoryJobStorage from '../app/db/in-memory-job-storage.js'
import { normalJob, longJob } from './jobs.js'
import InvalidParam from '../app/invalid-param.js'

describe('InMemoryJobStorage', () => {
  let storage = null

  beforeEach(() => {
    storage = new InMemoryJobStorage()
  })

  afterEach(() => {
    storage.deleteAll()
    storage = null
  })

  it('should be empty initially', async () => {
    const jobs = await storage.readAll()
    assert.equal(jobs.length, 0)
  })

  it('should reject with an error when creating an invalid job', async () => {
    const job = {}
    const error = new Error(`Invalid job: ${job}`)
    await assert.rejects(async () => await storage.create(job), error)
  })

  it('should create a job', async () => {
    const jobId = await storage.create(normalJob)
    const jobs = await storage.readAll()

    assert.equal(jobs.length, 1)
    // eslint-disable-next-line no-unused-vars
    const {id, detail: {trigger_timestamp, ...jobDetail}} = jobs[0];
    assert.equal(jobId, id)
    assert.deepEqual( jobDetail, normalJob)
  })

  it('should reject with an error when reading an invalid id', async () => {
    const id = '0'
    const error = new InvalidParam(`Invalid id: ${id}`)
    await assert.rejects(async () => await storage.read(id), error)
  })

  it('should return undefined when reading a non-existing job', async () => {
    const id = NIL
    const result = await storage.read(id);
    assert.equal(result, undefined)
  })

  it('should read a job', async () => {
    const id = await storage.create(normalJob)
    const job = await storage.read(id)
    // eslint-disable-next-line no-unused-vars
    const {trigger_timestamp, ...jobDetail} = job;
    assert.deepEqual(jobDetail, {
      ...normalJob
    })
  })

  it('should read all entries', async () => {
    // eslint-disable-next-line no-unused-vars
    const [id1, id2] = await Promise.all([
      storage.create(normalJob),
      storage.create(longJob)
    ])
    const jobs = await storage.readAll()
    assert.equal(jobs.length, 2)
    // assert.deepEqual(jobs, [
    //   {
    //     id: id1,
    //     detail: normalJob
    //   },
    //   {
    //     id: id2,
    //     detail: longJob
    //   }
    // ])
  })

  it('should reject with an error when updating an invalid id', async () => {
    const id = 0
    const error = new InvalidParam(`Invalid id: ${id}`)
    await assert.rejects(async () => await storage.update(id, { type: 'newType' }), error)
  })

  it('should reject with an error when updating a non-existing job', async () => {
    const id = NIL
    const error = new InvalidParam(`No job found for id: ${id}`)
    await assert.rejects(async () => await storage.update(id, { type: 'newType' }), error)
  })

  it('should update a job', async () => {
    const id = await storage.create(normalJob)
    await storage.update(id, {
      type: 'newType'
    })
    const { type } = await storage.read(id)
    assert.equal(type, 'newType')
  })

  it('should reject with an error when deleting an invalid id', async () => {
    const id = 0
    const error = new InvalidParam(`Invalid id: ${id}`)
    await assert.rejects(async () => await storage.delete(id), error)
  })

  it('should reject with an error when deleting a non-existing job', async () => {
    const id = NIL
    const error = new InvalidParam(`No job found for id: ${id}`)
    await assert.rejects(async () => await storage.delete(id), error)
  })

  it('should delete a job', async () => {
    const id = await storage.create(normalJob)
    let jobs = await storage.readAll()
    assert.equal(jobs.length, 1)
    await storage.delete(id)
    jobs = await storage.readAll()
    assert.equal(jobs.length, 0)
  })

  it('should delete all entries', async () => {
    await Promise.all([
      storage.create(normalJob),
      storage.create(longJob)
    ])
    let jobs = await storage.readAll()
    assert.equal(jobs.length, 2)
    await storage.deleteAll()
    jobs = await storage.readAll()
    assert.equal(jobs.length, 0)
  })
})

