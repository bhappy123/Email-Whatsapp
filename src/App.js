import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Header from './Header'
import Chat from './Chat'
import './App.css'
import Login from './Login'
import { useStateValue } from './StateProvider'
import { auth } from './firebase'

const App = () => {
  const [{ user }, dispatch] = useStateValue();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
  }, [])
  auth.onAuthStateChanged(currentUser => {
    if (currentUser) {
      setIsLoggedIn(true);
      console.log(currentUser)
    }
    else {
      setIsLoggedIn(false);
    }
  });
  return (
    <div>
      <Router>
        {!isLoggedIn ? (
          <Login />
        ) : <>
            <Header />
            <div className="app__body">
              <Sidebar />
              <Switch>
                <Route path="/room/:roomId">
                  <Chat />
                </Route>
              </Switch>
            </div>
          </>}

      </Router>
    </div>
  )
}
export default App
