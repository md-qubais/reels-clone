import React,{useState,useContext,useEffect} from "react"
import { AuthContext } from "../contexts/AuthProvider";
import {storage,firestore,database} from "../firebase"
import {
    Container,
    Grid,
    Card,
    Paper,
    TextField,
    makeStyles,
    CardContent,
    CardActions,
    CardMedia,
    Button,
  } from "@material-ui/core";
  import { Input } from '@material-ui/core';
  import { InputLabel } from '@material-ui/core';
  import PhotoCamera from "@material-ui/icons/PhotoCamera";

function Signup(props){
    const [userName,setUserName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [loader,setLoader] = useState(false);
    const [error,setError]  = useState(false);
    const [file,setFile] = useState(null);
    const {signup} = useContext(AuthContext)

    let useStyles = makeStyles({
        centerDiv: {
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          paddingTop:"3rem",
          backgroundColor:"rgb(250,250,250)"
        },
        
        alignCenter: {
          justifyContent: "center",
        },
        centerElements:{
            display:"flex",
            flexDirection:"column",
            alignItems:"center"
        }
        ,
        mb:{
            marginBottom:"0.8rem"
        },
        image:{
            height:"6rem",
            backgroundSize:"contain"
        },
        card:{
            height:"75%",
            width:"22rem"
        }
      });

    function handleFileSubmit(e){
        let file = e?.target?.files[0];
        console.log("in file submit")
        if(file!=null){
            setFile(file);
        }

    }
    async function handleSignUp(e){
        e.preventDefault()
        console.log("Signup")
        try{
            setLoader(true);
            let resp =  await signup(email,password);
            let uid = resp.user.uid;
            console.log("before uploading")
            const uploadTaskListener = storage.ref(`/users/${uid}/profileimage`).put(file);
            console.log("after uploading")
            uploadTaskListener.on('state_changed',fn1,fn2,fn3);
            
            //fn1 -> progress
            function fn1(snapshot){
                var progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100
                console.log(progress);
            }   
            //fn2 -> error
            function fn2(err){
                setError(err    )
                console.log("Got an error")
                setLoader(false)
            }
            //fn3 -> success
            async function fn3(){
                console.log("storage me daaldiye")
                let downloadUrl = await uploadTaskListener.snapshot.ref.getDownloadURL();
                database.users.doc(uid).set({
                    email:email,
                    userid : uid,
                    userName,
                    createdAt : database.getUserTimeStamp(),
                    profileUrl : downloadUrl,
                    postsIds:[]
                })
                setLoader(false)
                props.history.push("/login")
            }
        }catch(err){
            console.log("sign up error",err)
            setError(true);
            setLoader(false);

        }
    }

    let classes = useStyles()

    return (

        <div className={classes.centerDiv}>
<Card variant="outlined" className={classes.card}>
              <CardMedia image="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1024px-Instagram_logo.svg.png"
                  title="Instagram" className = {classes.image}>
                  
              </CardMedia>
              <CardContent className={classes.centerElements}>
                <TextField id="outlined-basic" variant="outlined" label="Email" type = "email" placeholder="abc@xyz.com" 
                className={classes.mb}
                size = "small"style={{display:"block"},{width:"80%"}} value = {email} onChange={(e)=>setEmail(e.target.value)} />

<TextField id="outlined-basic" variant="outlined" label="FullName" type = "text" placeholder="FullName" 
                className={classes.mb}
                size = "small"style={{display:"block"},{width:"80%"}}  />

<TextField id="outlined-basic" variant="outlined" label="UserName" type = "text" placeholder="hameeid__" 
                className={classes.mb}
                size = "small"style={{display:"block"},{width:"80%"}} value = {userName} onChange={(e)=>setUserName(e.target.value)} />

                <TextField variant = "outlined" label = "Password" type = "password" placeholder="Enter password"
                className = {classes.mb}
                size = "small" style={{display:"block"},{width:"80%"}} value={password} onChange={(e)=>setPassword(e.target.value)}></TextField>
                {/* <LinkElement content = "Forgor Password?" route = "/signup"></LinkElement> */}
                {/* <div> 
                    <label></label>
                 <input className = {classes.profile} type="file" accept = "image/*" placeholder="profile pic"   onChange={(e)=>handleFileSubmit(e)}/>
            </div> */}
            <div className={classes.root}>
          <input
            accept="file"
            className={classes.input}
            id="icon-button-file"
            type="file"
            disabled={loader}
            style={{display:"none"}}
            onChange={handleFileSubmit}
          />
          <label htmlFor="icon-button-file">
            <Button
              variant="outlined"
              color="secondary"
              component="span"
              disabled={loader}
              endIcon={<PhotoCamera />}
              style = {{marginBottom:"2rem",marginTop:"2rem"}}
            >
              Upload Profile pic
            </Button>
          </label>
        </div>

                <Button color = "primary" variant = "contained" style={{width:"100%",marginTop:"10px"}}
                onClick={(e)=>handleSignUp(e)}
                >Login</Button>
                {/* <LinkElement content = "Don't have an account? signup" route = "/signup"></LinkElement> */}
              </CardContent>
              <CardActions></CardActions>
            </Card>

            <div style={{position:"absolute",top:"35rem",backgroundColor:"rgb(255,255,255)",height:"3rem",
            width:"22rem", border:"1px solid lightgray",textAlign:"center",paddingTop:"10px"}}>
                Have an account? 
                <Button variant = "text" style={{color:"blue"}}>Login</Button>
            </div>
            

            {/* <form onSubmit={handleSignUp}>
            <div>
                <label htmlFor="">UserName</label>
                <input type="text" placeholder="Enter Username" value = {userName} onChange={(e)=>setUserName(e.target.value)}/>
            </div>
            <div>
                <label htmlFor="">Email</label>
                <input type="email" placeholder="Enter Email" value = {email} onChange={(e)=>setEmail(e.target.value)}/>
            </div>
            <div>
                <label htmlFor="">Password</label>
                <input type="password" placeholder="Enter Password" value = {password} onChange={(e)=>setPassword(e.target.value)}/>
            </div>
            <div>
                <label htmlFor="">Profile pic</label>
                <input type="file" accept = "image/*" placeholder="profile pic"   onChange={(e)=>handleFileSubmit(e)}/>
            </div>
            <button type = "submit" disabled = {loader}>SignUp</button>
            </form> */}
        </div>
    )
}
export default Signup