import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onError: () => void
}

interface State {
  failed: boolean
}

/**
 * A WebGL context that cannot be created (blocklisted GPU, too many contexts,
 * a lost device) throws during render. Catch it and let the page swap in the
 * still image rather than going blank.
 */
export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Ocean scene failed', error, info.componentStack)
    this.props.onError()
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children
  }
}
