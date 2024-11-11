import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import axios from 'axios';
import "./styles.css";

function UserList() {
  const [users, setUserList] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:3000/user/list')
      .then(result => {
        setUserList(result.data);
      })
      .catch(error => {
        console.error(error);
      });
  },[]);
 
  return (
    <div>
      <Typography variant="h5">
        User List
      </Typography>
      <List component="nav">
          {users.map(user => (
            <div key={user._id}>
              <Link className="userList-link" to={`/users/${user._id}`}>
                <ListItem key={user._id} className="listItem" >
                  <ListItemText className="userList-listItemText" primary={user.first_name + " " + user.last_name} />
                </ListItem>
              </Link>
              <Divider />
            </div>
          ))}
      </List>   
    </div>
  );
}

export default UserList;