import { Component } from 'react'

export default class Idle extends Component {
  static defaultProps = {
    timeout: 2000,
    events: [
      'mousemove',
      'keydown',
      'wheel',
      'DOMMouseScroll',
      'mousewheel',
      'mousedown',
      'touchstart',
      'touchmove',
      'MSPointerDown',
      'MSPointerMove'
    ],
    idleAction: () => {},
    activeAction: () => {}
  }

  timer = null
  idle = false

  _handleEvent = e => {
    clearTimeout(this.timer)

    if (this.idle) {
      this.props.activeAction()
      this.idle = false
    } else {
      this.detect()
    }
  }

  detect = () => {
    this.timer = setTimeout(() => {
      this.idle = true
      this.props.idleAction()
    }, this.props.timeout)
  }

  componentWillMount() {
    this.props.events.forEach(e => window.addEventListener(e, this._handleEvent))
  }

  componentDidMount() {
    this.detect()
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
    this.props.events.forEach(e => window.removeEventListener(e, this._handleEvent))
  }

  render() {
    return null
  }
}
