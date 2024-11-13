import React, {useEffect, useState, useContext} from "react";
import { CurrentUserContext} from '../../photoShare.jsx';
import axios from 'axios';
import "./styles.css";

function LoginRegister(){
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext);
    const [loginName, setLoginName] = useState("");
    
    function handleLogin(){
        const loginNameInput = document.getElementById("login_name").value;
        setLoginName(loginNameInput);

        axios.post('/admin/login', { login_name: loginNameInput })
        .then(response => {
            console.log('Login successful:', response.data);
            setCurrentUser(response.data);
        })
        .catch(error => {
            console.error('Login failed:', error);
        });
    }
    return(
        <> 
            <h2>Login</h2>
            <form>
                <label htmlFor="login_name">Name:</label><br/>
                <input type="text" id="login_name" name="login_name"/><br/>
                <label htmlFor="pwd">Password:</label><br/>
                <input type="password" id="pwd" name="pwd"/><br/>
                <input type="button" value="Login" onClick={handleLogin}></input>
            </form>
            <br/>
            <form>
                <label htmlFor="first_name">First Name:</label><br/>
                <input type="text" id="first_name" name="first_name"/><br/>
                <label htmlFor="login_name_register">Last Name:</label><br/>
                <input type="text" id="login_name_register" name="login_name_register"/><br/>
                <label htmlFor="pwd_register">Password:</label><br/>
                <input type="password" id="pwd_register" name="pwd_register"/><br/>
                <label htmlFor="confirmPwd">Confirm Password:</label><br/>
                <input type="password" id="confirmPwd" name="confirmPwd"/><br/>
                <label htmlFor="location">Location:</label><br/>
                <input type="text" id="location" name="location"/><br/>
                <label htmlFor="occupation">Occupation:</label><br/>
                <input type="text" id="occupation" name="occupation"/><br/>
                <label htmlFor="description">Description:</label><br/>
                <input type="text" id="description" name="description"/><br/>
                <input type="button" value="Register Me"></input>
            </form>
        </>
       
    )
}

export default LoginRegister;