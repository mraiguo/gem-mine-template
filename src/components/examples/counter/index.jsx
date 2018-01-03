import React from 'react'
import { actions, smart } from 'cat-eye'
import style from './style'

const Counter = props => {
  return (
    <div className={style.main}>
      <h1 className={style.number}>{props.count}</h1>
      <section>
        <button className={style.btn} onClick={props.decrement}>
          减少
        </button>
        <button className={style.btn} onClick={props.increment}>
          增加
        </button>
      </section>
    </div>
  )
}
export default smart(
  state => {
    return {
      count: state.example.count
    }
  },
  props => {
    return {
      increment() {
        actions.example.change(1)
      },
      decrement() {
        actions.example.change(-1)
      }
    }
  }
)(Counter)
