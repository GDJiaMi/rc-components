/**
 * title 设置和展示, 并且支持面包屑
 */
import Title, { TitleProps } from './Title'
import { TitleDesc, ContextValue } from './type'
import Provider, { Context } from './Provider'
import Route, { ExtendedRouteProps } from './Route'
import Display, { DisplayProps } from './Display'

export default Title
export {
  Provider,
  Context,
  Route,
  Display,
  // types
  TitleDesc,
  ContextValue,
  ExtendedRouteProps,
  TitleProps,
  DisplayProps,
}
