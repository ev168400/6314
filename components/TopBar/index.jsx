import React, {useEffect, useState, useContext} from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { useLocation } from 'react-router-dom';
import { CurrentUserContext} from '../../photoShare.jsx';
import axios from 'axios';
import "./styles.css";

function TopBar() {
  const [current, setCurrent] = useState("");
  const [loggedIn, setLoggedIn] = useState("Please Login");
  const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
  const location = useLocation();

  function handleLogout(){
    axios.post('/admin/logout')
        .then(response => {
            console.log('Logout successful:');
            setCurrentUser(null); 
            setLoggedIn("Please Login");  
        })
        .catch(error => {
            console.error('Logout failed:', error.response.data.error);
        });
  }

  useEffect(() => {
    const parts = location.pathname.split('/');
    if(currentUser){
      if(parts.length > 2){
        const userid = parts[parts.length-1];
        axios.get(`http://localhost:3000/user/${userid}`)
            .then(result => {
              setCurrent(parts[parts.length-2] === "photos" ? "Photos of " + result.data.first_name + " " + result.data.last_name : result.data.first_name + " " + result.data.last_name + "'s Profile");
            })
            .catch(error => {
              console.error(error);
            }); 
      }
      else{
        axios.get('http://localhost:3000/test/info')
        .then(result => {
          setCurrent("Version " + result.data.__v);
        })
        .catch(error => {
          console.error(error);
        });
      }
    }else{
      setCurrent("");
    }
  }, [location, currentUser]);


  
  useEffect(()=> {
    if(currentUser !== null){
      setLoggedIn(`Hi ${currentUser.first_name}`);
    }
  }, [currentUser])

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="topbar-toolBar">
        <Typography variant="h5" color="inherit">
            {loggedIn}
        </Typography>
        <Typography variant="h5" color="inherit">
            {current}
        </Typography>
        {loggedIn !== "Please Login" && <button className="toolBar-logoutButton" onClick={handleLogout}>Logout</button>}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;