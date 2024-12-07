import React, { useState, useEffect } from "react";
import { Grid, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import axios from 'axios';
import "./styles.css";

function UserDetail({ userId }) {
  const [user, setUser] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [photoUsers, setPhotoUsers] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:3000/user/${userId}`)
      .then(result => {
        setUser(result.data);
      })
      .catch(error => {
        console.error(error);
      });

    axios.get(`http://localhost:3000/mentionsOfUser/${userId}`)
      .then(result => {
        setMentions(result.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, [userId]);

  useEffect(() => {
    const fetchPhotoUsers = async () => {
      const users = {};
      const userRequests = mentions.map(async (mention) => {
        const mentionedUserId = mention.photo.user_id;
        if (!users[mentionedUserId]) {
          try {
            const result = await axios.get(`http://localhost:3000/user/${mentionedUserId}`);
            users[mentionedUserId] = result.data;
          } catch (error) {
            console.error(`Error fetching user data for ${mentionedUserId}`, error);
          }
        }
      });
      await Promise.all(userRequests);
      setPhotoUsers(users);
    };
  
    if (mentions.length > 0) {
      fetchPhotoUsers();
    }
  }, [mentions]);

  const formatPhotoHeader = (photoUserId) => {
    const photoUser = photoUsers[photoUserId];
    if (!photoUser) return <span>Loading...</span>;
    return (
      <span key={`photo-${photoUserId}`}>
        Mentioned in a comment on <Link to={`/users/${photoUserId}`} className="userDetail-mention-Photo-Name">{photoUser.first_name}</Link>&#39;s photo:
      </span>
    );
  };

  const formatComment = (comment) => {
    let commentSplit = comment.split(' ');
    let formattedComment = [];

    for (let index = 0; index < commentSplit.length; index++) {
      const mention = commentSplit[index];

      if (mention.startsWith('@')) {
        const name = mention.substring(1).toLowerCase();
        let combined = user.first_name.toLowerCase() + user.last_name.toLowerCase();

        if (user.first_name.toLowerCase() === name || user.last_name.toLowerCase() === name || combined === name) {
          formattedComment.push(
            <span key={`mention-${index}`} className="userDetail-mention-at">{mention}</span>
          );
        } else {
          formattedComment.push(mention);
        }
      } else {
        formattedComment.push(mention);
      }
      formattedComment.push(' ');
    }

    return <p>{formattedComment}</p>;
  };

  return (
    <div className="userDetail-profile">
      {user.length !== 0 && (
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
          <Divider sx={{ width: "100%" }} />
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
      <Grid container spacing={2}>
        <Grid item xs={12} />
        <Grid item xs={12} className="userDetail-mentions">
          Mentions
        </Grid>
        <Divider sx={{ width: "100%" }} />
        {mentions.length !== 0 && mentions.map(mention => (
          <Grid container spacing={1} key={mention._id}>
            <Grid item xs={9} className="userDetail-mention">
              <h4 className="userDetail-mention-Photo-Header">
                {formatPhotoHeader(mention.photo.user_id)}
              </h4>
              <Grid item xs={12} >
                <div className="userDetail-mention-comment">
                  {formatComment(mention.comment)}
                </div>
              </Grid> 
            </Grid>
            <Grid item xs={2} >
              <Link to={`/photos/${mention.photo.user_id}#photo-${mention.photo._id}`}>
                <img
                  src={`/images/${mention.photo.file_name}`}
                  className="userDetail-mention-Photo"
                />
              </Link>
            </Grid>
            <Grid item xs={1} />
          </Grid>
        ))}
        {mentions.length === 0 && <p className="userDetail-noMention">No mentions</p>}
      </Grid>
    </div>
  );
}

export default UserDetail;
