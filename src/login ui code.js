import React, { useState } from "react";
import { auth } from "./firebase"; // assumes firebase.js exports auth
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validateEmail = (email) => {
    return email.endsWith("@university.edu.pk");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Email must end with @university.edu.pk");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert(`Logged in as ${role}`);
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid Credentials");
      } else {
        setError("Network Error. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      setError("Enter a valid university email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (err) {
      setError("Error sending reset email. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* University Logo Placeholder */}
        <div style={styles.logo}>[University Logo]</div>

        <h2 style={styles.title}>University Portal Login</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.select}
          >
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Admin">Admin</option>
          </select>

          <input
            type="email"
            placeholder="Email (@university.edu.pk)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label style={styles.checkboxLabel}>I accept Terms & Conditions</label>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            onClick={handleForgotPassword}
            style={styles.linkButton}
          >
            Forgot Password?
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#f5f7fa",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "350px",
    textAlign: "center",
  },
  logo: {
    marginBottom: "20px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#555",
  },
  title: {
    marginBottom: "20px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  select: {
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  checkboxLabel: {
    marginLeft: "8px",
    fontSize: "14px",
    color: "#555",
  },
  error: {
    color: "red",
    marginBottom: "10px",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#004080",
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginBottom: "10px",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#004080",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
  },
};

export default Login;
