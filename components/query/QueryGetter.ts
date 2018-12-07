import moment from 'moment'

export default class Query {
  public obj: object

  public constructor(res: object) {
    this.obj = res
  }

  public query() {
    return this.obj
  }

  public has(key: string): boolean {
    return key in this.obj
  }

  public hasAndGet(key: string, getter: (key: string) => any): any {
    if (this.has(key)) {
      return getter(key)
    }
    return
  }

  public get = (key: string): string | undefined => {
    return this.obj[key]
  }

  public getInt = (key: string, defaultVal: number = 0) => {
    return key in this.obj ? parseInt(this.obj[key]) : defaultVal
  }

  public getFloat = (key: string, defaultVal: number = 0) => {
    return key in this.obj ? parseFloat(this.obj[key]) : defaultVal
  }

  public getBool = (key: string, defaultVal: boolean = false) => {
    if (key in this.obj) {
      const value = this.obj[key]
      switch (typeof value) {
        case 'boolean':
          return value
        case 'string':
          return value === 'true'
        default:
          return !!value
      }
    }
    return defaultVal
  }

  public getStr = (key: string, defaultVal: string = '') => {
    return key in this.obj ? this.obj[key] : defaultVal
  }

  public getDate = (
    key: string,
    format: string = 'YYYY-MM-DD',
    defaultVal: moment.Moment | string = moment(),
  ): moment.Moment => {
    return key in this.obj
      ? moment(this.obj[key], format)
      : typeof defaultVal === 'string'
      ? moment(defaultVal, format)
      : defaultVal
  }
}
