import * as React from 'react'
import Navbar from '../components/NavBar'
import BottomBar from '../components/BottomBar'
import DashBoard from '../components/DashBoard'


function App() {

  return (
    <React.Fragment>
      <Navbar />
      <DashBoard />
      <BottomBar />
    </React.Fragment>
    
  )
}

export default App