import {JOB_RESULT_CALLBACK_TYPE, JOB_STATUS_RESULT} from './job-constants.js'
import create_job from './job-utility.js'
import InvalidParam from '../invalid-param.js'

export default class JobManager {
  #storage = null
  #req = null
  #res = null
  #log = null

  constructor(req, res, storage, logger = console) {
    this.#req = req;
    this.#res = res;
    this.#storage = storage
    this.#log = logger.child({ module: 'job-manager' })
  }

  #checkJobRequestParameter(jobRequest){
    this.#checkJobCallbackType(jobRequest.job_result_callback_type);
    this.#if_required_headers_exist(jobRequest)
  }

  #checkJobCallbackType(job_result_callback_type) {
    if(!job_result_callback_type || job_result_callback_type !== JOB_RESULT_CALLBACK_TYPE.POLLING) {
      this.#log.error(`checkJobCallbackType failed: ${job_result_callback_type} is not correct type`)
      throw new InvalidParam(`Invalid job_result_callback_type: ${job_result_callback_type}`);
    }
  }

  #if_trigger_failed(jobRequest){
    if(jobRequest.trigger.expect_status_result === JOB_STATUS_RESULT.ERROR){
      return true;
    }
    return false;
  }

  #if_required_headers_exist(jobRequest){
    if(jobRequest?.trigger?.required_headers &&
      Object.keys(jobRequest?.trigger?.required_headers).length > 0 ){

      for (const [key, value] of Object.entries(jobRequest?.trigger?.required_headers)) {
        const lower_key = key.toLowerCase()
        const lower_value = value.toLowerCase()
        if(this.#req.headers.hasOwnProperty(lower_key) === false){
          throw new InvalidParam(`Missing header: ${lower_key}`);
          // throw new Error(`Missing header: ${lower_key}`)
        }
        if(this.#req.headers[lower_key] !== lower_value){
          throw new InvalidParam(`Header ${lower_key} value is not correct: expect ${lower_value}`)
        }
      }
    }
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

  async getAll(){
    const savedJobs = await this.#storage.readAll();
    let statusCode = 200
    let responseBody = savedJobs;
    this.#res.json(responseBody);
    this.#res.status(statusCode);
    this.#res.end();
  }

  async get(){
    const jobId = this.#req.params.id
    this.#log.debug(`get job for jobId ${jobId}`)
    const savedJob = await this.#storage.read(jobId);

    let statusCode = 200
    let responseBody = {};
    if(!this.#if_job_exist(savedJob)){
      this.#log.error(`get job failed: ${jobId} does not exist`)
      statusCode = 404;
      this.#res.status(statusCode);
    } else {
      const current_timestamp = new Date().getTime();
      const execution_seconds = (current_timestamp - savedJob.trigger_timestamp)/1000;
      let if_return_body = false;
      let if_return_location = false;
      let expect_status_result, expect_message;
      if(execution_seconds < savedJob.job_execution_time_second){
        //job is still runnintg
        statusCode = savedJob.polling.running_stage.expect_status_code;
        if_return_body = savedJob.polling.running_stage.if_return_body;
        if_return_location = savedJob.polling.running_stage.if_return_location;
        expect_status_result = savedJob.polling.running_stage.expect_status_result;
        expect_message = savedJob.polling.running_stage.expect_message;
        // this.#res.status(statusCode);
        // if(savedJob.polling.running_stage.if_return_location){
        //   const locationValue = `/api/v1/jobs/${jobId}`;
        //   this.#res.set({
        //     location: locationValue
        //   })
        // }

        // if(savedJob.polling.running_stage.if_return_body){
        //   responseBody[savedJob.polling.field_mapping.status] =
        //     savedJob.polling.status_value_mapping[savedJob.polling.running_stage.expect_status_result];
        //   responseBody[savedJob.polling.field_mapping.message] =
        //     savedJob.polling.running_stage.expect_message;
        //   responseBody[savedJob.polling.field_mapping.jobId] = jobId;
        //   responseBody['jobRequest'] = savedJob;
        //   this.#log.debug('job %s detail is %s', jobId, JSON.stringify(responseBody))
        //   this.#res.json(responseBody)
        // }

      } else {
        //job finished
        statusCode = savedJob.polling.expect_status_code;
        // this.#res.status(statusCode);
        statusCode = savedJob.polling.expect_status_code;
        if_return_body = savedJob.polling.if_return_body;
        expect_status_result = savedJob.polling.expect_status_result;
        expect_message = savedJob.polling.expect_message;

        // if(savedJob.polling.if_return_body){
        //   responseBody[savedJob.polling.field_mapping.status] =
        //     savedJob.polling.status_value_mapping[savedJob.polling.expect_status_result];
        //   responseBody[savedJob.polling.field_mapping.message] =
        //     savedJob.polling.expect_message;
        //   responseBody[savedJob.polling.field_mapping.jobId] = jobId;
        //   responseBody['jobRequest'] = savedJob;
        //   this.#log.debug('job %s detail is %s', jobId, JSON.stringify(responseBody))
        //   this.#res.json(responseBody)
        // }
      }

      this.#res.status(statusCode);

      if(if_return_location){
        const locationValue = `/api/v1/jobs/${jobId}`;
        this.#res.set({
          location: locationValue
        })
      }

      if(if_return_body){
        responseBody[savedJob.polling.field_mapping.status] =
          savedJob.polling.status_value_mapping[expect_status_result];
        responseBody[savedJob.polling.field_mapping.message] = expect_message;
        responseBody[savedJob.polling.field_mapping.jobId] = jobId;
        responseBody['jobRequest'] = savedJob;
        this.#log.debug('job %s detail is %s', jobId, JSON.stringify(responseBody))
        this.#res.json(responseBody)
      }

      // statusCode = savedJob.polling.expect_status_code;
      // this.#res.status(statusCode);

      // if(savedJob.polling.if_return_body) {
      //   const current_timestamp = new Date().getTime();
      //   const execution_seconds = (current_timestamp - savedJob.trigger_timestamp)/1000;
      //   if(execution_seconds < savedJob.job_execution_time_second){
      //     responseBody[savedJob.polling.field_mapping.status] =
      //       savedJob.polling.status_value_mapping[savedJob.polling.running_stage.expect_status_result];
      //     // responseBody[savedJob.polling.field_mapping.message]
      //   }else{
      //     responseBody[savedJob.polling.field_mapping.status] =
      //       savedJob.polling.status_value_mapping[savedJob.polling.expect_status_result];
      //     responseBody[savedJob.polling.field_mapping.message] =
      //       savedJob.polling.expect_message;
      //   }

      //   responseBody[savedJob.polling.field_mapping.jobId] = jobId;
      //   responseBody['jobRequest'] = savedJob;
      //   this.#log.debug('job %s detail is %s', jobId, JSON.stringify(responseBody))
      //   this.#res.json(responseBody)
      // }
    }
    this.#res.end();
  }

  async create() {
    const jobRequest = create_job(this.#req.body);
    this.#log.debug('request to create job is %s', JSON.stringify(jobRequest));
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
      responseBody[jobRequest.trigger.field_mapping.status] = jobRequest.trigger.status_value_mapping[jobRequest.trigger.expect_status_result];
      responseBody['jobRequest'] = {...savedJob};
    }

    this.#log.debug('response body to create job is %s', JSON.stringify(responseBody));

    this.#res.status(jobRequest.trigger.expect_status_code);
    if(jobRequest.trigger.if_return_body){
      this.#res.json(responseBody)
    }

    this.#res.end();
  }

  async deleteAll(){
    this.#log.info('all job will be deleted');
    await this.#storage.deleteAll();
    let statusCode = 200
    this.#res.status(statusCode);
    this.#res.end();
  }
}
