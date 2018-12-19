import H from 'history'

export interface TitleDesc {
  id: string
  link?: string
  content: React.ReactNode
}

export interface ContextValue {
  pushTitle: (t: TitleDesc) => void
  popTitle: (t: TitleDesc) => void
  updateTitle: (t: TitleDesc) => void
  titles: TitleDesc[]
  location: H.Location
}
