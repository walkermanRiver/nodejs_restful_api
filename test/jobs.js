import create_job from '../app/job/job.js'

const normalJob = create_job({
  name: 'normalJob',
  type: 'customized',
  trigger_time_ms: 500
});

const longJob = create_job({
  name: 'longJob',
  type: 'customized',
  trigger_time_ms: 1000,
  execution_time_second: 200
});

const JOBS = Object.freeze([normalJob, longJob])

export { normalJob, longJob, JOBS }
