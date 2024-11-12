import React, { useState, useEffect } from "react"; //imports
import { AppBar, Toolbar, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";
import axios from 'axios'; //switch to axios
import "./styles.css";

function TopBar() { //TopBar function
  const location = useLocation();
  const [header, setHeader] = useState("");
  const [version, setVersion] = useState("");
  const [userList, setUsernames] = useState([]);

  useEffect(() => { //get the version
    axios.get(`http://localhost:3000/test/info`)
    .then(result => {
      setVersion(result.data.__v);
    })
    .catch(error => {
      console.error(error);
    });
  }, []);

  useEffect(() => { //get the users
    axios.get(`http://localhost:3000/user/list`)
    .then(result => {
      setUsernames(result.data);
    })
    .catch(error => {
      console.error(error);
    });
  }, []);

  useEffect(() => {
    const updateHeader = () => {
      //split url into parts
      const splitLocation = location.pathname.split("/").filter(Boolean);
      //find url relating to user id
      const userId = splitLocation[splitLocation.length - 1];
      //determine the user
      const user = userList.find((u) => u._id === userId);

      if (user) { //determine the header based on the view
        if (location.pathname.includes("/users/")) {
          setHeader(`${user.first_name} ${user.last_name}`);
        } else if (location.pathname.includes("/photos/")) {
          setHeader(`Photos of ${user.first_name} ${user.last_name}`);
        }
      } else {
        setHeader("PhotoShare App");
      }
    };

    updateHeader();
  }, [location]);


  return (
    <AppBar className="topbar-appBar" position="static">
      <Toolbar className="topbar-toolBar">
        <Typography variant="h5" color="inherit">
        Jeremiah De Luna
        </Typography>
        <Typography className="header-right">{header} - Version: {version}</Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
