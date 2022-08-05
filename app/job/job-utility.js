import { JOB_STATUS_RESULT, JOB_RESULT_CALLBACK_TYPE } from './job-constants.js'

const jobTempalate = {
  name:'defaultJobName',
  job_result_callback_type:JOB_RESULT_CALLBACK_TYPE.POLLING,
  job_execution_time_second: 2,
  trigger:{
    expect_status_code: 200,
    expect_status_result: JOB_STATUS_RESULT.SUCCESS,
    // expect_status_result_value: JOB_STATUS_RESULT.SUCCESS,
    expect_message:'default Message',
    // request_process_time_ms:100,
    if_return_body: true,
    if_return_location: false,
    required_headers:[],
    field_mapping:{
      'status':'status',
      'message': 'message',
      'jobId': 'jobId'
    },
    status_value_mapping:{
      'RUNNING':'RUNNING',
      'SUCCESS':'SUCCESS',
      'FAILED': 'FAILED'
    }
  },
  polling: {
    expect_status_code: 200,
    expect_status_result: JOB_STATUS_RESULT.SUCCESS,
    // expect_status_result_value: JOB_STATUS_RESULT.SUCCESS,
    expect_message:'default message',
    // request_process_time_ms: 100,
    if_return_body: true,
    running_stage:{
      expect_status_code: 200,
      expect_status_result: JOB_STATUS_RESULT.RUNNING,
      expect_message: 'default running message',
      if_return_location_: false,
      if_return_body: true,
    },
    field_mapping:{
      'status':'status',
      'message': 'message',
      'jobId': 'jobId'
    },
    status_value_mapping:{
      'RUNNING':'RUNNING',
      'SUCCESS':'SUCCESS',
      'FAILED': 'FAILED'
    }
  },
};

function deepAssign(...param) {
  let result = Object.assign({}, ...param);
  for (let item of param) {
      for (let [idx, val] of Object.entries(item)) {
          if (typeof val === 'object') {
            if(Array.isArray(val)){
              result[idx] = [...val]
            }else{
              result[idx] = deepAssign(result[idx], val);
            }

          }
      }
  }
  return result;
}


export default function create_job(job){
  const newJob = deepAssign(jobTempalate, job)
  return newJob;
}


