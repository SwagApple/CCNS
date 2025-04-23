import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountPage.css';

const AccountPage = () => {
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [password, setPassword] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error(error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChangeName = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fname, lname }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const data = await response.json();
      setUserData(data);
      alert('Name updated successfully');
    } catch (error) {
      console.error(error);
    }
  }
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const data = await response.json();
      setUserData(data);
      alert('Email updated successfully');
    } catch (error) {
      console.error(error);
    }
  }
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password, newPassword }),
      });

      if (response.status === 401) {
        alert('Incorrect password');
        return;
      } else if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const data = await response.json();
      setUserData(data);
      alert('Password updated successfully');
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div className="account-page">
      <div className="account-info">
        <h2>Account Information</h2>
        {userData ? (
          <div>
            <p><strong>Name:</strong> {userData.fname} {userData.lname}</p>
            <input 
            type="text"
            placeholder="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            />
            <input
            type="text"
            placeholder="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            />
            <button onClick={handleChangeName}>Change Name</button>
            <p><strong>Email:</strong> {userData.email}</p>
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleChangeEmail}>Change Email</button>
            <p><strong>Password</strong></p>
            <input
            type="password"
            placeholder="Old Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={handleChangePassword}>Change Password</button>
            <button onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}>Logout</button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
