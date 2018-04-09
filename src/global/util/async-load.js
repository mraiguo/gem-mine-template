import React from 'react'
import Loadable from 'react-loadable'

// loading
const Loading = ({ isLoading, error }) => {
  if (isLoading) {
    return <div>loading...</div>
  } else if (error) {
    console.error(error)
    return <div>Sorry, we get some problems.</div>
  } else {
    return null
  }
}

export default function (path) {
  return Loadable({
    loader: () => {
      return import(`components/${path}`)
    },
    loading: Loading
  })
}
