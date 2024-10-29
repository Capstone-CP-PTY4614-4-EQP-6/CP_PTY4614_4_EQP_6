import * as React from 'react'
import Navbar from '../components/NavBar'
import BottomBar from '../components/BottomBar'
import HomePage from '../components/HomePage'

function Home() {

  return (
    <React.Fragment>
      <Navbar />
      <HomePage />
      <BottomBar />
    </React.Fragment>
    
  )
}

export default Home
