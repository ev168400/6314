import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import axios from "axios";
import "./styles.css";

import { CurrentUserContext } from "../context/context.js";

function UserList() {
  const [users, setUserList] = useState([]);
  const [recentPosts, setRecentPosts] = useState({});
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

  useEffect(() => {
    if (currentUser === null) {
      setUserList([]);
      return;
    }

    const userListRequest = axios.get("http://localhost:3000/user/list");
    const currentUserRequest = axios.get(`http://localhost:3000/user/${currentUser._id}`);
    const topPhotosRequest = axios.get(`http://localhost:3000/topPhotos/${currentUser._id}`);

    Promise.all([userListRequest, currentUserRequest, topPhotosRequest])
      .then(([userListResult, currentUserResult, topPhotosResult]) => {
        setUserList(userListResult.data);

        if (currentUser && currentUserResult.data && currentUser.recentActivity !== currentUserResult.data.recentActivity) {
          setCurrentUser(currentUserResult.data);
        }

        if (currentUser && topPhotosResult.data) {
          setRecentPosts((prevState) => ({
            ...prevState,
            [currentUser._id]: topPhotosResult.data.mostRecent,
          })); 
        }

        userListResult.data.forEach((user) => {
          if (user._id !== currentUser._id) {
            axios.get(`http://localhost:3000/topPhotos/${user._id}`)
              .then((response) => {
                setRecentPosts((prevState) => ({
                  ...prevState,
                  [user._id]: response.data.mostRecent,
                }));
              })
              .catch((error) => {
                console.error("Error fetching recent posts for friend:", error);
              });
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error.response?.data?.error || error);
        setUserList([]);
      });
  }, [currentUser]);

  const formatActivity = (activity) => {
    switch (activity) {
      case "login":
        return "Logged in";
      case "logout":
        return "Logged out";
      case "register":
        return "Registered new profile";
      case "comment":
        return "Commented on a photo";
      case "posted":
        return "Posted a photo";
      default:
        return "";
    }
  };

  return (
    <div>
      {currentUser !== null && (
        <>
          <Typography variant="h5">User</Typography>
          <Link className="userList-link" to={`/users/${currentUser._id}`}>
            <ListItem key={currentUser._id} className="listItem">
              <ListItemText
                className="userList-listItemText"
                primary={currentUser.first_name + " " + currentUser.last_name}
                style={{ fontWeight: 'bold' }}
              />
            </ListItem>
          </Link>
          {typeof currentUser.recentActivity !== "undefined" && (
            <div className="userList-Recent-Post">
              <p className="userList-Recent">
                <em>Recently: </em>
                {formatActivity(currentUser.recentActivity)}
              </p>
              {currentUser.recentActivity === "posted" && recentPosts[currentUser._id] && (
                  <Link to={`/photos/${recentPosts[currentUser._id].user_id}#photo-${recentPosts[currentUser._id]._id}`}>
                    <img
                      src={`/images/${recentPosts[currentUser._id].file_name}`}
                      className="userList-recent-Photo"
                      alt="Recent post thumbnail"
                    />
                  </Link>
              )}
            </div>
          )}
          <Divider sx={{ mt: 2 }}/>

          <Typography variant="h5" sx={{ mt: 2 }}>Friends</Typography>
          <List component="nav">
            {users
              .filter((user) => user._id !== currentUser._id)
              .map((user) => (
                <div key={user._id}>
                  <Link className="userList-link" to={`/users/${user._id}`}>
                    <ListItem key={user._id} className="listItem">
                      <ListItemText
                        className="userList-listItemText"
                        primary={user.first_name + " " + user.last_name}
                      />
                    </ListItem>
                  </Link>
                  {typeof user.recentActivity !== "undefined" && (
                    <div className="userList-Recent-Post">
                      <p className="userList-Recent">
                        <em>Recently: </em>
                        {formatActivity(user.recentActivity)}
                      </p>
                      {user.recentActivity === "posted" && recentPosts[user._id] && (
                          <Link to={`/photos/${recentPosts[user._id].user_id}#photo-${recentPosts[user._id]._id}`}>
                            <img
                              src={`/images/${recentPosts[user._id].file_name}`}
                              className="userList-recent-Photo"
                              alt="Friend's recent post thumbnail"
                            />
                          </Link>
                      )}
                    </div>
                  )}
                  <Divider sx={{ mt: 2 }}/>
                </div>
              ))}
          </List>
        </>
      )}
    </div>
  );
}

export default UserList;
