import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import { Avatar } from "@material-ui/core";
import { database, storage } from "../firebase";
import uuid from "react-uuid";
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import ChatIcon from '@material-ui/icons/Chat';


function Feed(props) {
  const [pageLoading, setPageLoading] = useState(true);
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [videos,setVideos] = useState([])
  const [liked,setLiked] = useState([])
  const { currentUser } = useContext(AuthContext);
  const { signout } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);

  const useStyles = makeStyles((theme) => ({
    root: {
      "& > *": {
        margin: theme.spacing(1),
      },
    },
    input: {
      display: "none",
    },
    heart:{
      position:"relative",
      bottom:"50vh",
      right:"4vw",
      fontSize:"2rem",
      color:"white"
      
  },
  comment:{
    position:"relative",
      bottom:"40vh",
      right:"6vw",
      fontSize:"2rem",
      color:"white"
  },
  selected:{
    color:"red"
  }
  
    
  }));
  const classes = useStyles();

  useEffect(async () => {
    if(currentUser==null){
      props.history.push("/login")
    }
    else{
      let dataObject = await database.users.doc(currentUser.uid).get();
    setUser(dataObject.data());
    setPageLoading(false);
    }
  }, []);

  useEffect(async ()=>{

    let unsub = await database.posts.orderBy("createdAt","desc").onSnapshot(async (snapshot)=>{
    let videos = snapshot.docs.map((doc)=> doc.data())
    let videosArr=[]
    let likesArr = []
    for(let i = 0; i < videos.length; i++){
      let videoUrl = videos[i].url;
      let vlikes = videos[i].likes;
      let id = snapshot.docs[i].id;
      let auid = videos[i].Auid;
      let userObj = await database.users.doc(auid).get();
      let userName = userObj.data().userName;
      let profileUrl = userObj.data().profileUrl;
      
      let liked = false;
      for(let j = 0; j < vlikes.length; j++){
          if(vlikes[j] == currentUser.uid){
            liked = true;
            break;
          }
      }
      likesArr.push(liked);
      videosArr.push({videoUrl,auid,userName,profileUrl,id})
    } 
    setVideos(videosArr);
    setLiked(likesArr);
    })

    return unsub
  },[])

  const handleLike=async (videoObj,idx)=>{
    let postRef = await database.posts.doc(videoObj.id).get();
    let post = postRef.data();
    let likes = post.likes;
    if(liked[idx] == false){
      database.posts.doc(videoObj.id).update({
       "likes" : [...likes,currentUser.uid]
      })
      let temp = [...liked];
      temp[idx] = true;
      setLiked(temp);
      
    }else{  
      let filteredlikes = likes.filter(uid=>{
        return uid != currentUser.uid
      })
      database.posts.doc(videoObj.id).update({
        "likes": filteredlikes
      })
      let temp = [...liked];
      temp[idx] = false;
      setLiked(temp);
      
    }
   
  }

  const handleLogout = async (e) => {
   e.preventDefault();
    try {
      setLoading(true);
      // auth provider
      console.log("in try")
      await signout();
      setLoading(false);
      props.history.push("/login")
    } catch (err) {
      console.log(err)
      setLoading(false);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    let file = e?.target?.files[0];
    if (!file) {
      return;
    }

    if (file.size / (1024 * 1024) > 30) {
      alert("file you uploaded is too big! please upload file under 20 mb");
      return;
    }

    const uploadTaskListener = storage.ref(`/posts/${uuid()}`).put(file);
    setLoading(true);

    //fn1 -> progress

    const fn1 = (snapshot) => {
      let progress = (snapshot.bytesTransferred / snapshot.totalBytes)*100;
      setProgress(progress);
    };

    //fn2 -> error
    const fn2 = (error) => {
      console.log(error);
    };
    //fn3-> success
    const fn3 = () => {
      uploadTaskListener.snapshot.ref.getDownloadURL().then(async (url) => {
        let obj = {
          comments: [],
          likes: [],
          url,
          Auid: currentUser.uid,
          createdAt: database.getUserTimeStamp(),
        };

        //adding object to posts collection
        let postObject = await database.posts.add(obj);

        await database.users.doc(currentUser.uid).update({
             postsIds:[...user.postsIds,postObject.id]
        })
        setLoading(false);
      }).catch(err=>{
          console.log(err);
      })
    };
    
    uploadTaskListener.on("state_changed", fn1, fn2, fn3);
  };

  const handleComments=()=>{
    console.log("comments handling")
  }

  return pageLoading == true ? (
    <div className = "loader">
    <CircularIndeterminate />
  </div>
  ) : (
    <div>
     
     <div>
     <ButtonAppBar 
      clickMe = {handleLogout} 
      loading 
      src = {user.profileUrl}

      ></ButtonAppBar>
     </div>
      <div className="main">
      <div className="uploadImage">
        <div className={classes.root}>
          <input
            accept="file"
            className={classes.input}
            id="icon-button-file"
            type="file"
            disabled={loading}
            onChange={handleUpload}
          />
          <label htmlFor="icon-button-file">
            <Button
              variant="contained"
              color="primary"
              component="span"
              disabled={loading}
              endIcon={<PhotoCamera />}
            >
              Upload
            </Button>
          </label>
        </div>
      {progress > 0 && progress < 100 ? <div className="progress">
      <CircularProgressWithLabel value={progress} /> 

      </div> : <div/>}
      </div>
    <div className="feed-bar">
    <div className="feed">
      {videos.map((videoObj,idx)=>{
        return <div className = "video-container">
          <Video 
            src = {videoObj.videoUrl}
            id = {videoObj.id}
          >
          </Video>
          {liked[idx] == false ? <FavoriteBorderOutlinedIcon className = {classes.heart} onClick = {()=>{handleLike(videoObj,idx)}} >
            
          </FavoriteBorderOutlinedIcon > : <FavoriteIcon className = {[classes.heart,classes.selected]}  onClick = {()=>{handleLike(videoObj,idx)}} ></FavoriteIcon> }
          <ChatIcon className = {classes.comment} onClick={handleComments} ></ChatIcon>
        </div>
       
      })}
      
    </div>
    </div>
    </div>
      </div>
  );
}
export default Feed;


function Video(props) {
  return (
    <video className="video-styles" controls muted = {true} id = {props.id}>
            <source src = {
                props.src
            } type = "video/mp4" ></source>
            
        </video>
  );
}

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

function CircularIndeterminate() {
  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      '& > * + *': {
        marginLeft: theme.spacing(2),
      },
    },
  }));
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress color="secondary" />
    </div>
  );
}

function ButtonAppBar(props) {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor:"white",
      color:"white",

     
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    image:{
      height:"2rem"
    },
    img:{
      height:"100%"
    }
  }));

  const classes = useStyles();

 

  return (
    <div className={classes.root}>
      <AppBar position="fixed" color="white" height="3rem" >
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="secondary" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <div className={classes.image}>
          <img className = {classes.img} src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/1024px-Instagram_logo.svg.png" alt="Instagram" />

          </div>
          <Typography variant="h6" className={classes.title}>
            
          </Typography>
          {/* <Button variant = "outlined" color = "secondary" onClick={()=>{
            console.log("clicked");
            props.clickMe()
          }} >
          Logout
        </Button> */}
        <Button variant = "outlined" color = "secondary" onClick = {(e)=>{
          console.log("clicked")
          props.clickMe(e);
        }}  >logout</Button>
        <div >
        <Avatar className = "profile" src={props.src} onClick={()=>{
            props.history.push("/profile")
        }} />
       
      </div>
         
        </Toolbar>
      </AppBar>
    </div>
  );
}