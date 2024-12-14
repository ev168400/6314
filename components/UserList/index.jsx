import React, {useState, useEffect, useContext} from "react";
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

import { CurrentUserContext } from "../context/context.js";

function UserList() {
  const [users, setUserList] = useState([]);
  const {currentUser} = useContext(CurrentUserContext);

  useEffect(() => {
    if(currentUser !== null){
      axios.get('http://localhost:3000/user/list')
      .then(result => {
        //put current user at top of list
        const sortedUsers = result.data.sort((a, b) => {
          if (a._id === currentUser._id) return -1;
          if (b._id === currentUser._id) return 1;
          return 0;
        });
        setUserList(sortedUsers);
      })
      .catch(error => {
        setUserList([]);
        console.error(error.response.data.error);
      });
    }else{
      setUserList([]);
    }
    
  },[currentUser]);
 
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
