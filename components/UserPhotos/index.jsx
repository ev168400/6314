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
  var [users, setUsers] = useState([]);

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

  //Fetches all users
  const fetchUsers = () =>{
    axios.get('http://localhost:3000/user/list')
      .then(result => {
        setUsers(result.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  //Returns user who matches the name provided or returns false if no user matches the name
  const getUser = (name) =>{
    name = name.toLowerCase();
    for(let user of users){
      let combined = user.first_name.toLowerCase() + user.last_name.toLowerCase();
      if(user.first_name.toLowerCase() === name || user.last_name.toLowerCase() === name || combined === name){
        return user;
      }
    }
    return false;
  };
  
  //Adds link to comment with an @
  const formatComment = (comment) =>{
    let commentSplit = comment.split(' ');
    let formattedComment = [];
    for(let mention of commentSplit){
      if(mention.startsWith('@')){
        const mentionedUser = getUser(mention.substring(1));
        if(mentionedUser){
          formattedComment.push(
            <Link key={mentionedUser._id} className="userPhotos-mention-link" to={`/users/${mentionedUser._id}`}>
              {mention}
            </Link>
          );
        }else{
          formattedComment.push(mention);
        }
      }else{
        formattedComment.push(mention);
      }
      formattedComment.push(' ');
    }
    return <p className="userPhotos-commentText">{formattedComment}</p>;
  };

  const scrollToPhoto = (photoId) => {
    const photoElement = document.getElementById(photoId); 
    if (photoElement) {
      photoElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start', 
      });
    }else{
      console.log("nope");
    }
  };

  // Fetch photos when the component mounts or userId changes
  useEffect(() => {
    fetchPhotos();
    fetchUsers();

    const fullUrl = window.location.href;
    const hashed = fullUrl.split('#');
    if (hashed[2]) {
      setTimeout(() => {
        scrollToPhoto(hashed[2]); 
      }, 500); 
    }
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
    let commentSplit = comment.split(' ');
    const mentionPromises = commentSplit.map(async (word) => {
      if(word.startsWith('@')) {
        let mentionedUser = getUser(word.substring(1));
        if(mentionedUser) {
          let mention = {
            comment: comment,
            mentioned_id: mentionedUser._id,
          };
  
          try {
            await axios.post(`http://localhost:3000/mention/${photoId}`, { mention });
          } catch (error) {
            console.error("Error adding mention:", error);
            setPhotoErrors((prevErrors) => ({
              ...prevErrors,
              [photoId]: "Failed to add mention",
            }));
          
            setTimeout(() => {
              setPhotoErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                delete newErrors[photoId]; 
                return newErrors; 
              });
            }, 3000);
          }
        }
      }
    });
  
    // Wait for all mentions to be processed concurrently
    await Promise.all(mentionPromises);
  
    

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
            <img src={`/images/${photo.file_name}`} id={`photo-${photo._id}`}/>
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
                    {formatComment(comment.comment)}
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
