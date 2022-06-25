import {JOB_RESULT as JOB_STATUS_RESULT} from './job-constants.js'

const JOB_RESULT_CALLBACK_TYPE = {
  // DIRECT: 'direct',
  POLLING: 'polling',
  // callback_report: 'callback'
}

const jobTempalate = {
  name:'defaultJobName',
  job_result_callback_type:JOB_RESULT_CALLBACK_TYPE.POLLING,
  job_execution_time_second: 2,
  trigger:{
    expect_status_code: 200,
    expect_status_result: JOB_STATUS_RESULT.SUCCESS,
    request_process_time_ms:100,
    if_return_body: true,
    if_return_location: false,
  },
  polling: {
    expect_status_code: 200,
    expect_status_result: JOB_STATUS_RESULT.SUCCESS,
    request_process_time_ms: 100,
    if_return_body: true,
  },
};

export default function create_job(job){
  const newJob = {...jobTempalate, ...job}
  return newJob;
}

