import React, { useEffect, useState, useContext, useRef } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./styles.css";

import { CurrentUserContext } from "../context/context.js";

function TopBar({ onPhotoUploaded }) {
  const [current, setCurrent] = useState("");
  const [loggedIn, setLoggedIn] = useState("Please Login");
  const [fileName, setFileName] = useState(""); 
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileFailure, setFileFailure] = useState(false);
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  const location = useLocation();
  const uploadInput = useRef(null);

  function handleLogout() {
    axios
      .post(`/admin/logout/${currentUser._id}`)
      .then(() => {
        console.log("Logout successful");
        setCurrentUser(null);
        setLoggedIn("Please Login");
      })
      .catch((error) => {
        console.error("Logout failed:", error.response.data.error);
      });
  }

  // Runs when location or currentUser changes
  useEffect(() => {
    const parts = location.pathname.split("/");
    if (currentUser) {
      if (parts.length > 2) {
        const userid = parts[parts.length - 1];
        axios
          .get(`http://localhost:3000/user/${userid}`)
          .then((result) => {
            const newCurrent = parts[parts.length - 2] === "photos"
              ? "Photos of " + result.data.first_name + " " + result.data.last_name
              : result.data.first_name + " " + result.data.last_name + "'s Profile";
            
            if (newCurrent !== current) {
              setCurrent(newCurrent);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        axios
          .get("http://localhost:3000/test/info")
          .then((result) => {
            const newCurrent = "Version " + result.data.__v;
            if (newCurrent !== current) {
              setCurrent(newCurrent);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      setCurrent("");
    }
  }, [location, currentUser, current]); 

  useEffect(() => {
    if (currentUser !== null) {
      setLoggedIn(`Hi ${currentUser.first_name}`);
    } else {
      setLoggedIn("Please Login");
    }
  }, [currentUser]); 

  function showSuccess(){
    setFileUploaded(true);
    setTimeout(() => {
      setFileUploaded(false);
    }, 3000);
  }

  function showFailure(){
    setFileFailure(true);
    setTimeout(() => {
      setFileFailure(false);
    }, 3000);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name); 
    } else {
      showFailure();
    }
  };

  const handleUploadButtonClicked = async (e) => {
    e.preventDefault();
    if (uploadInput.current.files.length > 0) {
      const domForm = new FormData();
      console.log(uploadInput.current.files[0]);
      domForm.append("uploadedphoto", uploadInput.current.files[0]);

      axios.post("/photos/new", domForm)
        .then((res) => {
          console.log("Photo uploaded successfully:", res.data);
          showSuccess();
          setFileName("");
          if (onPhotoUploaded) {
            onPhotoUploaded();
          }
        })
        .catch((err) => {
          console.error("Error uploading photo:", err);
          showFailure();
        });

        //Log the activity
      const activityResult = await axios.post(`http://localhost:3000/activity/${currentUser._id}`, { recentActivity: "posted" });
      setCurrentUser(activityResult.data);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar className="topbar-toolBar">
        <Typography variant="h5" color="inherit">
          {loggedIn}
        </Typography>
        <Typography variant="h5" color="inherit">
          {current}
        </Typography>
        {loggedIn !== "Please Login" && (
          <>
            <input
              type="file"
              accept="image/*"
              ref={uploadInput}
              style={{ display: "none" }}
              id="upload-photo-input"
              onChange={handleFileChange} 
            />
            <label htmlFor="upload-photo-input">
              <button
                className="toolBar-fileUpload"
                onClick={() => {
                  document.getElementById("upload-photo-input").click();
                }}
              >
                Choose Photo
              </button>
            </label>

            {fileName && <span>{fileName}</span>} 
            {fileName && <button className="toolBar-photoUpload" onClick={handleUploadButtonClicked}> Upload Photo </button>}
            {fileUploaded && <p className = "success-message">Photo Uploaded Successfully</p>}
            {fileFailure && <p className = "failure-message">Photo Upload Failed</p>}

            <button className="toolBar-logoutButton" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
