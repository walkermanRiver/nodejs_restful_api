export default class JobStorage {
  constructor () {
    if (this.constructor === JobStorage) {
      throw new Error('Abstract class')
    }
  }

  async create (job) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented')
  }

  async read (id) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented')
  }

  async readAll () {
    throw new Error('Not implemented')
  }

  async update (id, movie) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented')
  }

  async delete (id) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented')
  }

  async deleteAll () {
    throw new Error('Not implemented')
  }
}
