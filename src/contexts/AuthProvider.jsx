import auth from "../firebase"
import React from 'react';
import { useState,useEffect,useContext } from 'react';
export const AuthContext = React.createContext();

export function AuthProvider({children}) {
    const [loader,setLoader] = useState(true);
    const [currentUser,setCurrentUser] = useState(null);
    
    function login(email,password){
        return auth.signInWithEmailAndPassword(email,password);
    }
    async function signout(){
        return await auth.signOut()
    }

    async function signup(email,password){
        return auth.createUserWithEmailAndPassword(email,password);
    }

    useEffect(()=>{
        const unsubscribe = auth.onAuthStateChanged(user=>{
            setCurrentUser(user);
            setLoader(false)
        })
        return unsubscribe
    },[])

    let value = {
        currentUser,
        signout,
        login,
        signup
    }
    return (
        <AuthContext.Provider value = {value}>
            {!loader && children}
        </AuthContext.Provider>
    );
}

