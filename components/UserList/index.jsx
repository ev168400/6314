import React, { useEffect, useState } from "react"; //imports
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";
import axios from 'axios'; //switch to axios
import "./styles.css";

function UserList() { //UserList function
  const [usernames, setUsernames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { //get the users
    axios.get(`http://localhost:3000/user/list`)
    .then(result => {
      setUsernames(result.data);
    })
    .catch(error => {
      console.error(error);
    });
  }, []);

  return (
    <List>
      <Divider />
      {usernames.map((user) => (
        <Typography variant="body1" key={user._id}>
          <ListItem>
            <ListItemButton onClick={() => navigate(`/users/${user._id}`)}>
            <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItemButton>
          </ListItem>
          <Divider />
        </Typography>
      ))}
    </List>
  );
}

export default UserList;
