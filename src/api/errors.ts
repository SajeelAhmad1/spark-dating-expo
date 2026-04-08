export class HttpError extends Error {
  constructor(
    public readonly status:  number,
    public readonly code:    string,
    message:                 string,
    public readonly data?:   unknown,
  ) {
    super(message)
    this.name = 'HttpError'
    Object.setPrototypeOf(this, HttpError.prototype)
  }

  get isUnauthorized() { return this.status === 401 }
  get isForbidden()    { return this.status === 403 }
  get isNotFound()     { return this.status === 404 }
  get isServerError()  { return this.status >= 500 }
}