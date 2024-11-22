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
  const [newComments, setNewComments] = useState({});
  const [photoErrors, setPhotoErrors] = useState({});

  // A reusable function to fetch photos
  const fetchPhotos = () => {
    axios.get(`http://localhost:3000/photosOfUser/${userId}`)
      .then(result => {
        setUserPhotos(result.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  // Fetch photos when the component mounts or userId changes
  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  const handleCommentChange = (photoId, value) => {
    setNewComments({ ...newComments, [photoId]: value });
  };

  const handleAddComment = async (photoId) => {
    const comment = newComments[photoId];
    if (!comment || comment.trim() === "") {
      setPhotoErrors((prevErrors) => ({
        ...prevErrors,
        [photoId]: "Comment cannot be empty",
      }));

      setTimeout(() => {
        setPhotoErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[photoId]; 
          return newErrors;
        });
      }, 3000);

      return;
    }
    

    try {
      await axios.post(`http://localhost:3000/commentsOfPhoto/${photoId}`, { comment });
      // Refresh the photos with the updated comments
      const result = await axios.get(`http://localhost:3000/photosOfUser/${userId}`);
      setUserPhotos(result.data);
      // Clear the input for the commented photo
      setNewComments({ ...newComments, [photoId]: "" });
    } catch (error) {
      console.error("Error adding comment:", error);
      setPhotoErrors((prevErrors) => ({
        ...prevErrors,
        [photoId]: "Failed to add comment",
      }));

      setTimeout(() => {
        setPhotoErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[photoId]; 
          return newErrors;
        });
      }, 3000);
    }
  };

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
            <div className="addComment">
              <input
                type="text"
                placeholder="Add a comment"
                value={newComments[photo._id] || ""}
                onChange={(e) => handleCommentChange(photo._id, e.target.value)}
              />
              <button onClick={() => handleAddComment(photo._id)}>Add Comment</button>
              {photoErrors[photo._id] && (
                <p className="failure-message">{photoErrors[photo._id]}</p>
              )}
            </div>
          </div>
        ))}
      </List>
  );
}

export default UserPhotos;
