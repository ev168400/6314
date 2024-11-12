import React, { useEffect, useState } from "react"; //imports
import {
  Typography,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";
import axios from 'axios'; //switch to axios
import "./styles.css";

function UserDetail({userId}) { //UserDetail function
  const [username, setUsername] = useState(null);

  useEffect(() => { //update the user
    axios.get(`http://localhost:3000/user/${userId}`)
    .then(result => {
      setUsername(result.data);
    })
    .catch(error => {
      console.error(error);
    });
  }, [userId]);

  if (!username) return null;

  return (
    <div>
      <Typography variant="h3">
        {username.first_name} {username.last_name}
      </Typography>
      <Typography variant="body1">Occupation: {username.occupation}</Typography>
      <Typography variant="body1">Location: {username.location}</Typography>
      <Typography variant="body1">Description: {username.description}</Typography>
      <Link
        component={RouterLink}
        to={`/photos/${username._id}`}
        underline="hover"
        style={{ cursor: "pointer", color: "blue" }}
      >
        View Photos for {username.first_name} {username.last_name}
      </Link>
    </div>
  );
}

export default UserDetail;
