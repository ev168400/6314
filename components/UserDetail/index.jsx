import React, { useState, useEffect, useContext } from "react";
import { Grid, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import axios from 'axios';
import "./styles.css";
import { CurrentUserContext } from "../context/context.js";

function UserDetail({ userId }) {
  const [user, setUser] = useState({});
  const [mentions, setMentions] = useState([]);
  const [warning, setWarning] = useState(false);
  const [photoUsers, setPhotoUsers] = useState({});
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

  useEffect(() => {
    // Fetch user details
    axios.get(`http://localhost:3000/user/${userId}`)
      .then(result => setUser(result.data))
      .catch(error => console.error(error));

    // Fetch mentions of the user
    axios.get(`http://localhost:3000/mentionsOfUser/${userId}`)
      .then(result => setMentions(result.data))
      .catch(error => console.error(error));
  }, [userId]);

  useEffect(() => {
    const fetchPhotoUsersAndCommenters = async () => {
      const loadingState = {};  

      // Create an array of requests 
      const userRequests = mentions.map((mention) => {
        const photoUserId = mention.photo.user_id;
        const commenterId = mention.commenter_id;

        // If photoUser and commenter are not in state, fetch their data
        if (!(photoUserId in photoUsers) && !(commenterId in photoUsers)) {
          // Mark as loading
          if (!loadingState[photoUserId]) loadingState[photoUserId] = true;
          if (!loadingState[commenterId]) loadingState[commenterId] = true;

          return Promise.all([
            axios.get(`http://localhost:3000/user/${photoUserId}`),
            axios.get(`http://localhost:3000/user/${commenterId}`)
          ])
            .then(([photoUserResult, commenterResult]) => {
              // Update photoUsers state 
              setPhotoUsers((prev) => ({
                ...prev,
                [photoUserId]: photoUserResult.data,
                [commenterId]: commenterResult.data
              }));
            })
            .catch((error) => {
              console.error(`Error fetching user data for ${photoUserId} or ${commenterId}`, error);
            })
            .finally(() => {
              loadingState[photoUserId] = false;
              loadingState[commenterId] = false;
            });
        }

        return Promise.resolve(); 
      });

      // Wait for all user requests to finish
      await Promise.all(userRequests);
    };

    if (mentions.length > 0) {
      fetchPhotoUsersAndCommenters();
    }
  }, [mentions, photoUsers]);  

  const formatPhotoHeader = (index) => {
    const mention = mentions[index];
    const photoUser = photoUsers[mention.photo.user_id];
    const commenter = photoUsers[mention.commenter_id];

    if (!photoUser || !commenter) {
      return <span>Loading...</span>;
    }

    return (
      <span key={`photo-${photoUser._id}`}>
        Mentioned in&nbsp;
        <Link to={`/users/${commenter._id}`} className="userDetail-mention-Photo-Name">
          {commenter.first_name}
        </Link>
        &#39;s comment on&nbsp;
        <Link to={`/users/${photoUser._id}`} className="userDetail-mention-Photo-Name">
          {photoUser.first_name}
        </Link>
        &#39;s photo:
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

  const showWarning = () => {
    setWarning(true);
  };

  const cancelWarning = () => {
    setWarning(false);
  };

  const handleProfileDelete = () => {
    axios.delete(`http://localhost:3000/deleteUser/${userId}`)
      .then(() => {
        console.log("Profile Deleted");
        setCurrentUser(null);
      })
      .catch(error => console.error(error));
  };

  return (
    <div className="userDetail-profile">
      {!warning && (
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
          <Grid item xs={12} />
          <Grid item xs={12} className="userDetail-mentions">
            Mentions
          </Grid>
          <Divider sx={{ width: "100%" }} />
          {mentions.length !== 0 && mentions.map((mention, index) => (
            <Grid container spacing={1} key={mention._id}>
              <Grid item xs={9} className="userDetail-mention">
                <h4 className="userDetail-mention-Photo-Header">
                  {formatPhotoHeader(index)}
                </h4>
                <Grid item xs={12}>
                  <div className="userDetail-mention-comment">
                    {formatComment(mention.comment)}
                  </div>
                </Grid>
              </Grid>
              <Grid item xs={2}>
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
          {currentUser._id === userId && (
            <>
              <Grid item xs={12} />
              <Grid item xs={12}>
                <div className="userDetail-delete-profile">
                  <button className="userDetail-delete-profile-button" onClick={showWarning}>
                    Delete Profile
                  </button>
                </div>
              </Grid>
            </>
          )}
        </Grid>
      )}
      {warning && (
        <div className="userDetail-Warning">
          <h2>Are you sure you want to delete your profile?</h2>
          <p>All information will be removed from our app including any photos and comments you have posted</p>
          <p>Deleted information cannot be restored</p>
          <div className="userDetails-Warning-Options">
            <button className="userDetail-delete-profile-button" onClick={handleProfileDelete}>
              Delete Profile
            </button>
            <button className="userDetail-cancel-delete-button" onClick={cancelWarning}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetail;
