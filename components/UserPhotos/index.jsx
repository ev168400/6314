import React, { useEffect, useState } from "react"; //imports
import {
  Divider,
  List,
  ListItem,
  Typography,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
//import fetchModel from "../../lib/fetchModelData";
import axios from 'axios'; //switch to axios
import "./styles.css";
// PROJECT 77777777777777
function UserPhotos({userId}) { //UserPhotos function
  const [photos, setPhotos] = useState([]);

  useEffect(() => { //get the photos
    axios.get(`http://localhost:3000/photosOfUser/${userId}`)
    .then(result => {
      setPhotos(result.data);
    })
    .catch(error => {
      console.error(error);
    });
  }, [userId]);

  const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString(); //user friendly string
};

  return (
    <div>
      <List>
        {photos.map((photo) => (
          <div key={photo._id}>
            <ListItem>
              <img
                src={`/images/${photo.file_name}`}
                alt={`User ${userId}`}
                style={{ maxWidth: "100%", maxHeight: "250px" }}
              />
            </ListItem>
            <Typography variant="caption">
              Created on: {formatDate(photo.date_time)}
            </Typography>
            <Divider />
            <Typography variant="subtitle1">Comments:</Typography>
            {photo.comments?.length > 0 ? (
  <List>
    {photo.comments.map((comment) => (
      <div key={comment._id}>
        <ListItem>
          <Typography variant="body2">
          <Link
            component={RouterLink}
            to={`/users/${comment.user?._id}`}
            underline="hover"
            style={{ cursor: "pointer", color: "blue" }}
          >
            {comment.user?.first_name} {comment.user?.last_name}
          </Link>
            : {comment.comment}
          </Typography>
        </ListItem>
        <Typography variant="caption">
          Commented on: {formatDate(comment.date_time)}
        </Typography>
        <Divider />
      </div>
    ))}
  </List>
) : (
  <Typography variant="body2">No comments yet.</Typography>
)}

            <Divider />
          </div>
        ))}
      </List>
    </div>
  );
}

export default UserPhotos;
