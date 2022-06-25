export default class InvalidParam extends Error {
  constructor(message = 'Invalid Parameter') {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
