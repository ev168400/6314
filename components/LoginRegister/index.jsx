import React, {useState, useContext} from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CurrentUserContext } from "../context/context.js";
import "./styles.css";

function LoginRegister(){
    const {setCurrentUser} = useContext(CurrentUserContext);
    const [errorExistLogin, setErrorExistLogin] = useState(false);
    const [errorMessageLogin, setErrorMessageLogin] = useState("");
    const [errorExist, setErrorExist] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate(); 

    function handleLogin(){
        setErrorExistLogin(false);

        const loginNameInput = document.getElementById("login_name").value;
        const passwordInput = document.getElementById("pwd").value;
        if(passwordInput === "" || loginNameInput === ""){
            setErrorExistLogin(true);
            setErrorMessageLogin(loginNameInput === "" ? "Name cannot be empty" : "Password cannot be empty");
        }else{
            axios.post('/admin/login', { login_name: loginNameInput, password: passwordInput })
            .then(response => {
                console.log('Login successful:', response.data);
                setCurrentUser(response.data);
                axios.post(`http://localhost:3000/activity/${response.data._id}`, { recentActivity: "login" })
                .then(activityResponse => {
                    console.log("Login Activity logged: ");
                    setCurrentUser(activityResponse.data);
                });
                navigate(`/users/${response.data._id}`);
            })
            .catch(error => {
                setErrorExistLogin(true);
                setErrorMessageLogin(error.response.data.error, ". Please try again");
                console.error('Login failed:', error.response.data.error, ' Status', error.response.status);
            });
        }
    }

    function handleRegister(){
        setErrorExist(false);
        const loginNameInput = document.getElementById("login_name_register").value;
        const passwordInput = document.getElementById("pwd_register").value;
        const confirmPwdInput = document.getElementById("confirmPwd").value;
        const first_nameInput = document.getElementById("first_name").value;
        const last_nameInput = document.getElementById("last_name").value;
        const locationInput = document.getElementById("location").value;
        const occupationInput = document.getElementById("occupation").value;
        const descriptionInput = document.getElementById("description").value;
        if(passwordInput === confirmPwdInput){
            axios.post('/user', { login_name: loginNameInput, password: passwordInput, first_name: first_nameInput, last_name: last_nameInput, location: locationInput, occupation: occupationInput, description: descriptionInput})
            .then(response => {
                console.log('Registration successful:', response.data);
                const inputFields = document.querySelectorAll('input[type="text"], input[type="password"], textarea');
                inputFields.forEach(field => {
                    field.value = "";
                });
                setErrorExist(false);
                axios.post('/admin/login', { login_name: loginNameInput, password: passwordInput })
                .then(loginResponse => {
                    console.log('Login after registration successful:', loginResponse.data);
                    setCurrentUser(loginResponse.data);
                    navigate(`/users/${loginResponse.data._id}`);
                });
            }) 
            .catch(error => {
                setErrorExist(true);
                setErrorMessage(error.response.data.error.replace(/_/g, ' '));
                console.error('Registration failed:', error.response.data.error, ' Status', error.response.status);
            });
        }else{
            setErrorExist(true);
            setErrorMessage("Password and Confirm Password must match");
        }
    }
    return(
        <div className="login-register"> 
            <div className="login">
                <h2>Login</h2>
                {errorExistLogin && <p className = "error-message">{errorMessageLogin}</p>}
                <form className="loginForm">
                    <label htmlFor="login_name">Name:</label><br/>
                    <input type="text" id="login_name" name="login_name"/><br/>
                    <label htmlFor="pwd">Password:</label><br/>
                    <input type="password" id="pwd" name="pwd"/><br/>
                    <input className="login-button" type="button" value="Login" onClick={handleLogin}></input>
                </form>
            </div>
            <br/>
            <div className="register">
                <h2>Register</h2>
                {errorExist && <p className = "error-message">{errorMessage}</p>}
                <form className="registrationForm">
                    <label htmlFor="login_name_register">Username:</label><br/>
                    <input type="text" id="login_name_register" name="login_name_register"/><br/>
                    <label htmlFor="pwd_register">Password:</label><br/>
                    <input type="password" id="pwd_register" name="pwd_register"/><br/>
                    <label htmlFor="confirmPwd">Confirm Password:</label><br/>
                    <input type="password" id="confirmPwd" name="confirmPwd"/><br/>
                    <label htmlFor="first_name">First Name:</label><br/>
                    <input type="text" id="first_name" name="first_name"/><br/>
                    <label htmlFor="last_name">Last Name:</label><br/>
                    <input type="text" id="last_name" name="last_name"/><br/>
                    <label htmlFor="location">Location:</label><br/>
                    <input type="text" id="location" name="location"/><br/>
                    <label htmlFor="occupation">Occupation:</label><br/>
                    <input type="text" id="occupation" name="occupation"/><br/>
                    <label htmlFor="description">Description:</label><br/>
                    <textarea type="text" id="description" name="description" rows="4" cols="50"/><br/>
                    <input className="register-button" type="button" value="Register Me" onClick={handleRegister}></input>
                </form>
            </div>
        </div>
       
    );
}

export default LoginRegister;