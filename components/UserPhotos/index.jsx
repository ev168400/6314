import React, {useState, useEffect} from "react";
import { List } from "@mui/material";
import { Link } from "react-router-dom";
import axios from 'axios';
import "./styles.css";

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour12: true, hour: '2-digit', minute: '2-digit' };
  return `${date.toLocaleTimeString('en-US', options)}`;
}

function UserPhotos({userId}) {
  var [photos, setUserPhotos] = useState([]);
  useEffect(() => {
    axios.get(`http://localhost:3000/photosOfUser/${userId}`)
      .then(result => {
        setUserPhotos(result.data);
      })
      .catch(error => {
        console.error(error);
      });
  },[userId]);

  return (
      <List>
        {photos.map(photo => (
          <div key={photo._id}>
            <p className="userPhotos-photoDate">{formatDate(photo.date_time)}</p>
            <img src={`/images/${photo.file_name}`}/>
            {"comments" in photo && (
              photo.comments.map(comment => (
                <div key={comment._id} className="userPhotos-comment">
                  <div className="userPhotos-commentHeader">
                    <div className="userPhotos-commentHeaderLink">
                      <Link to={`/users/${comment.user._id}`}>{comment.user.first_name + " " + comment.user.last_name}</Link>
                    </div>
                    <div className="userPhotos-commentHeaderP">
                      <p>{formatDate(comment.date_time)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="userPhotos-commentText">{comment.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </List>
  );
}

export default UserPhotos;