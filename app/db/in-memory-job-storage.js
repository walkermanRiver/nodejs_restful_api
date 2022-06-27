import { v4 as uuid, validate } from 'uuid'
import JobStorage from './job-storage.js'
import InvalidParam from '../invalid-param.js'

export default class InMemoryJobStorage extends JobStorage{
  #data = null

  constructor() {
    super();
    this.#data = new Map()
  }

  #generateId() {
    return uuid()
  }

  #checkId(id, if_check_existence = false) {
    if (!id || !validate(id)) {
      throw new InvalidParam(`Invalid id: ${id}`);
    }
    if (if_check_existence && !this.#data.has(id)) {
      throw new InvalidParam(`No job found for id: ${id}`)
    }
  }

  #checkJob(job) {
    if (!job || typeof job !== 'object' || Object.keys(job).length === 0) {
      throw new Error(`Invalid job: ${job}`)
    }
  }

  async create(job) {
    this.#checkJob(job)
    const id = this.#generateId()
    const trigger_timestamp = new Date().getTime();
    this.#data.set(id, {
      trigger_timestamp,
      ...job
    })
    return id;
  }

  async read(id) {
    this.#checkId(id)
    const job = this.#data.get(id)
    return job
  }

  async readAll() {
    const jobList = []
    for (const jobEntry of this.#data.entries()) {
      jobList.push({id:jobEntry[0], detail:jobEntry[1]})
    }
    return jobList
  }

  async update(id, job) {
    const if_check_existence = true;
    this.#checkId(id, if_check_existence)
    this.#checkJob(job)
    this.#data.set(id, {
      ...job
    })
  }

  async delete(id) {
    const if_check_existence = true;
    this.#checkId(id, if_check_existence)
    this.#data.delete(id)
  }

  async deleteAll() {
    this.#data.clear()
  }
}
