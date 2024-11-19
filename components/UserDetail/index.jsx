import React, {useState, useEffect} from "react";
import { Grid, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import axios from 'axios';
import "./styles.css";

function UserDetail({userId}) {
  var [user, setUser] = useState([]);
  useEffect(() => {
    axios.get(`http://localhost:3000/user/${userId}`)
      .then(result => {
        setUser(result.data);
      })
      .catch(error => {
        console.error(error);
      });
  },[userId]);

  
  return (
    <div className="userDetail-profile">
      {  user.length !== 0 && (
        <Grid container spacing={2}>
          <Grid item xs={9} className="userDetail-Name">
            {user.first_name + " " + user.last_name}
          </Grid>
          <Grid item xs={3} className="userDetail-gridButton">
            <button className="userDetail-button">
              <Link className="userDetail-link" to={`/photos/${userId}`}>
                Photo Album
              </Link>
            </button>
          </Grid>
          <Grid item xs={12} className="userDetail-desc">
            {user.description}
          </Grid>
          <Grid item xs={12} className="userDetail-about">
            About
          </Grid>
          <Divider sx={{width:"100%"}}/>
          <Grid item xs={6} className="userDetail-col">
            User Id
          </Grid>
          <Grid item xs={6} className="userDetail-id">
            {user._id}
          </Grid>
          <Grid item xs={6} className="userDetail-col">
            Name
          </Grid>
          <Grid item xs={6} className="userDetail">
            {user.first_name + " " + user.last_name}
          </Grid>
          <Grid item xs={6} className="userDetail-col">
            Occupation
          </Grid>
          <Grid item xs={6} className="userDetail">
            {user.occupation}
          </Grid>
          <Grid item xs={6} className="userDetail-col">
            Location
          </Grid>
          <Grid item xs={6} className="userDetail">
            {user.location}
          </Grid>
        </Grid>
      )}
    </div>
  );
}

export default UserDetail;
