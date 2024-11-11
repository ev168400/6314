import React, {useEffect, useState} from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import "./styles.css";

function TopBar() {
  const [current, setCurrent] = useState("");
  const location = useLocation();

  useEffect(() => {
    const parts = location.pathname.split('/');
    if(parts.length > 2){
      const userid = parts[parts.length-1];
      axios.get(`http://localhost:3000/user/${userid}`)
          .then(result => {
            setCurrent(parts[parts.length-2] === "photos" ? "Photos of " + result.data.first_name + " " + result.data.last_name : result.data.first_name + " " + result.data.last_name);
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
  }, [location]);

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="topbar-toolBar">
        <Typography variant="h5" color="inherit">
            Eddie Villarreal
        </Typography>
        <Typography variant="h5" color="inherit">
            {current}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;