import React, {useState,useContext,useEffect} from "react"
import {Link} from "react-router-dom"
function Profile(){
    useEffect(()=>{
        console.log("Profile is rendered");
    })
    return (
        <>
        <div>Profile</div>
        <Link to = "/Login">Login</Link>
        </>
    )
}
export default Profile