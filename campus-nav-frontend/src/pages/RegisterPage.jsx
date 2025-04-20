import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, fname, lname }),
        });
      
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.access_token);
          navigate("/login")
        } else if (response.status === 409) {
          alert("Email already exists");
        } else if (response.status === 400) {
          alert("Password must be at least 10 characters long");
        } else {
          alert("Registration failed");
        }
    };

    return (
        <div className="login-container">
        <form className="login-form" onSubmit={handleRegister}>
          <h2>Welcome</h2>
          <p>Please register to continue</p>
          <input
            type="text"
            placeholder="First Name"
            value={fname}
            required
            onChange={(e) => setFname(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lname}
            required
            onChange={(e) => setLname(e.target.value)}
          />
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
          <button type="submit">Register</button>
        </form>
      </div>
    );
}

export default RegisterPage
