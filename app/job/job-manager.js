import create_job from './job/job.js'

export default class JobManager {
  #storage = null
  #req = null
  #res = null

  constructor(req, res, storage) {
    this.#req = req;
    this.#res = res;
    this.#storage = storage
  }

  async readAll() {
    const job = create_job(this.#req.body);
    const jobId = await this.#storage.create(job);
    const savedJob = await this.#storage.read(jobId);
    if(job.if_return_location){
      const locationValue = `/api/v1/jobs/${jobId}`;
      this.#res.set({
        location: locationValue
      })
    }

    this.#res.status(job.returned_status_code);

    if(job.if_return_body){
      this.#res.json({id:jobId, ...savedJob})
    }

    this.#res.end();
  }
}
