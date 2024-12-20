import React, {useState, useMemo} from "react";
import ReactDOM from "react-dom/client";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, Navigate } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import { CurrentUserContext } from "./components/context/context";

function UserDetailRoute() {
  const {userId} = useParams();
  //console.log("UserDetailRoute: userId is:", userId);
  return <UserDetail userId={userId} />;
}


function UserPhotosRoute() {
  const {userId} = useParams();
  return <UserPhotos userId={userId} />;
}

function PhotoShare() {
  const [currentUser, setCurrentUser] = useState(null);
  const contextValue = useMemo(() => ({ currentUser, setCurrentUser }), [currentUser]);
  
  return (
    <CurrentUserContext.Provider
     value={contextValue}>
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                <UserList />
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item">
                <Routes>
                  <Route path="/users/:userId" element={currentUser ? <UserDetailRoute /> : <Navigate to="/" /> } />
                  <Route path="/photos/:userId" element={currentUser ? <UserPhotosRoute />  : <Navigate to="/" /> } />
                  <Route path="/users" element={<UserList />} />
                  <Route path="/" element={<LoginRegister />} />
                </Routes>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    </CurrentUserContext.Provider>
  );
}


const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
