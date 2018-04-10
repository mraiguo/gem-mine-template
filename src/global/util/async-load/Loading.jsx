import React from 'react'

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

export default Loading
