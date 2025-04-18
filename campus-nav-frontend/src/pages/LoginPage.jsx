import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
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
          <button type="submit">Login</button>
          <div className="login-footer">
            <a href="#">Forgot password?</a>
          </div>
        </form>
      </div>
    );
}

export default LoginPage
