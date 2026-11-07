
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";

import { auth } from "./firebase";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(result.user, {
          displayName: name
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function googleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg,#10172a,#263c68)",
      fontFamily: "Arial"
    }}>
      <div style={{
        background: "white",
        padding: "35px",
        borderRadius: "20px",
        width: "320px",
        textAlign: "center"
      }}>
        <h1 style={{color:"#3157b7"}}>SkillPath</h1>
        <p>Your Career Journey Starts Here</p>

        <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <button onClick={googleLogin} style={{
          ...buttonStyle,
          background: "#444"
        }}>
          Continue with Google
        </button>

        {error && (
          <p style={{color:"red", fontSize:"13px"}}>{error}</p>
        )}

        <p>
          {isSignup ? "Already have an account?" : "New to SkillPath?"}
        </p>

        <button
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}
          style={{
            border: "none",
            background: "none",
            color: "#3157b7",
            cursor: "pointer"
          }}
        >
          {isSignup ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "8px 0",
  boxSizing: "border-box",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  background: "#3157b7",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer"
};
