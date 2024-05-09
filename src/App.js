import logo from "./logo.svg";
import "./App.css";
import react, { useContext, useEffect, useState } from "react";
import auth from "./firebase";
import {Switch,Route,BrowserRouter  as Router,Redirect,Link} from "react-router-dom"
import Feed from "./components/Feed"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Profile from "./components/Profile"
import {AuthContext, AuthProvider} from "./contexts/AuthProvider"
function App() {
  useEffect(()=>{
    console.log("App is rendered")
  })
  return (
  <Router>
      <AuthProvider>
      <Switch>
        <Route path = "/login" component={Login}></Route>
        <Route path = "/signup" component={Signup}></Route> 
        <PrivateRoute path = "/profile" component={Profile}></PrivateRoute>
        <PrivateRoute path = "/"  component={Feed}></PrivateRoute>
      </Switch>
      </AuthProvider>
  </Router>
  )
}
function PrivateRoute(props){
  let Component = props.component;
  let {currentUser } = useContext(AuthContext);
  return (<Route {...props} render = {(props)=>{
    return currentUser!=null ? <Component {...props}></Component>:
    <Redirect to = "/login"></Redirect>
  }}></Route>

  )
}
export default App;
