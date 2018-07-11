/**
 * 时间显示组件
 */
import React from 'react'

const today = new Date()
today.setHours(0, 0, 0)
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
yesterday.setHours(0, 0, 0)
const thisYear = new Date()
thisYear.setMonth(0, 1)
thisYear.setHours(0, 0, 0)

function isYesterDay(date: Date) {
  return date >= yesterday && date < today
}

function isToday(date: Date) {
  return date >= today
}

function atLeastOneYear(date: Date) {
  return thisYear > date
}

function formatTime(date: Date): string {
  const hour = ('0' + date.getHours()).slice(-2)
  const min = ('0' + date.getMinutes()).slice(-2)
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  return isYesterDay(date)
    ? `昨天 ${hour}:${min}`
    : isToday(date)
      ? `今天 ${hour}:${min}`
      : atLeastOneYear(date)
        ? `${date.getFullYear()}-${month}-${day} ${hour}:${min}`
        : `${month}-${day} ${hour}:${min}`
}

export interface TimeProps {
  time: number
}

export default class Time extends React.PureComponent<TimeProps> {
  public render() {
    const date = new Date(this.props.time)
    return formatTime(date)
  }
}
