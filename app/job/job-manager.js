import {JOB_RESULT_CALLBACK_TYPE, JOB_STATUS_RESULT} from './job-constants.js'
import create_job from './job-utility.js'
import InvalidParam from '../invalid-param.js'

export default class JobManager {
  #storage = null
  #req = null
  #res = null

  constructor(req, res, storage) {
    this.#req = req;
    this.#res = res;
    this.#storage = storage
  }

  #checkJobRequestParameter(jobRequest){
    this.#checkJobCallbackType(jobRequest.job_result_callback_type);
  }

  #checkJobCallbackType(job_result_callback_type) {
    if(!job_result_callback_type || job_result_callback_type !== JOB_RESULT_CALLBACK_TYPE.POLLING) {
      throw new InvalidParam(`Invalid job_result_callback_type: ${job_result_callback_type}`);
    }
  }

  #if_trigger_failed(jobRequest){
    if(jobRequest.trigger.expect_status_result === JOB_STATUS_RESULT.ERROR){
      return true;
    }
    return false;
  }

  #if_polling_failed(savedJob){
    if(savedJob.polling.expect_status_result === JOB_STATUS_RESULT.ERROR){
      return true;
    }
    return false;
  }

  #if_job_exist(savedJob){
    if(!savedJob){
      return false;
    }else{
      return true;
    }
  }

  async get(){
    const jobId = this.#req.params.id
    const savedJob = await this.#storage.read(jobId);

    let statusCode = 200
    let responseBody = {};
    if(!this.#if_job_exist(savedJob)){
      statusCode = 404;
    } else {
      statusCode = savedJob.polling.expect_status_code;

      if(savedJob.polling.if_return_body) {
        const current_timestamp = new Date().getTime();
        const execution_seconds = (current_timestamp - savedJob.trigger_timestamp)/1000;
        if(execution_seconds < savedJob.job_execution_time_second){
          responseBody[savedJob.polling.field_mapping.status] =
            savedJob.polling.status_value_mapping[JOB_STATUS_RESULT.RUNNING];
          // responseBody[savedJob.polling.field_mapping.message]
        }else{
          responseBody[savedJob.polling.field_mapping.status] =
            savedJob.polling.status_value_mapping[savedJob.polling.expect_status_result];
          responseBody[savedJob.polling.field_mapping.message] =
            savedJob.polling.expect_message;
        }

        responseBody[savedJob.polling.field_mapping.jobId] = jobId;
        responseBody['jobRequest'] = savedJob;
        this.#res.json(responseBody)
      }
    }

    this.#res.status(statusCode);
    this.#res.end();
  }

  async create() {
    const jobRequest = create_job(this.#req.body);
    this.#checkJobRequestParameter(jobRequest);

    const responseBody = {};
    responseBody[jobRequest.trigger.field_mapping.status] =
      jobRequest.trigger.status_value_mapping[jobRequest.trigger.expect_status_result];
    responseBody[jobRequest.trigger.field_mapping.message] =
        jobRequest.trigger.expect_message;

    if(this.#if_trigger_failed(jobRequest)){
      responseBody['jobRequest'] = jobRequest;
    } else {
      const jobId = await this.#storage.create(jobRequest);
      const savedJob = await this.#storage.read(jobId);
      if(jobRequest.trigger.if_return_location){
        const locationValue = `/api/v1/jobs/${jobId}`;
        this.#res.set({
          location: locationValue
        })
      }
      responseBody[jobRequest.trigger.field_mapping.jobId] = jobId;
      responseBody['jobRequest'] = {...savedJob};
    }

    if(jobRequest.trigger.if_return_body){
      this.#res.json(responseBody)
    }
    this.#res.status(jobRequest.trigger.expect_status_code);
    this.#res.end();
  }
}
