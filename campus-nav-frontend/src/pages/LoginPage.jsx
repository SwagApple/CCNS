import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import './LoginPage.css';

function LoginPage() {
    const [captchaValue, setCaptchaValue] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
    };
    // handleLogin function to handle the login process when the user submits the form
    // It checks if the CAPTCHA is completed, and if so, it sends a POST request to the server with the email and password
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!captchaValue) {
            alert("Please complete the CAPTCHA");
            return;
        }
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.access_token);
          navigate("/")
          alert("Login successful!");
        } else {
          alert("Invalid credentials");
        }
    };

    return (
      // A simple login form that allows users to enter their email and password
      // It also includes a reCAPTCHA for security
        <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>
          <p>Please sign in to continue</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <ReCAPTCHA
            sitekey="6LfjRx4rAAAAAJplWYPrXcghF5uIBrcYNXJiMxJx"
            onChange={handleCaptchaChange}
          />
          <button type="submit">Login</button>
          <div className="login-footer">
            <a href="/register">New User?</a>
          </div>
        </form>
      </div>
    );
}

export default LoginPage
