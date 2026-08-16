import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = "https://ai-recipe-generator-465f.onrender.com";

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  const [isLogin, setIsLogin] = useState(isLoginPage);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");

    const url = isLogin
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/register`;

    const body = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);

        setMessage("Login successful! 🎉");

        setTimeout(() => {
          navigate("/app");
        }, 500);
      } else {
        setMessage("Registration successful! 🎉");

        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          setIsLogin(true);
          navigate("/login");
        }, 700);
      }
    } catch (error) {
      setMessage("Cannot connect to server");
    }
  };

  const switchAuth = () => {
    setMessage("");

    if (isLogin) {
      setIsLogin(false);
      navigate("/register");
    } else {
      setIsLogin(true);
      navigate("/login");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "#f8f1ff",
        padding: "40px 20px",
      }}
    >
      <div
        className="card shadow-lg border-0 p-4"
        style={{
          width: "100%",
          maxWidth: "500px",
          borderRadius: "25px",
        }}
      >
        <div className="text-center mb-4">
          <h1
            className="fw-bold"
            style={{ color: "#6f42c1" }}
          >
            🍳 AI Recipe Generator
          </h1>

          <h3 className="fw-bold mt-3">
            {isLogin ? "Welcome Back! 👋" : "Create Your Account"}
          </h3>

          <p className="text-muted">
            {isLogin
              ? "Login to generate and manage your recipes."
              : "Sign up to start creating personalized recipes."}
          </p>
        </div>

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div className="mb-3">
              <label className="form-label fw-bold">
                Name
              </label>

              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-bold">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{
              backgroundColor: "#6f42c1",
              border: "none",
              borderRadius: "25px",
              padding: "12px",
            }}
          >
            {isLogin ? "🔐 Login" : "✨ Sign Up"}
          </button>
        </form>

        {message && (
          <div className="alert alert-info text-center mt-3">
            {message}
          </div>
        )}

        <div className="text-center mt-4">
          <button
            type="button"
            className="btn btn-link"
            onClick={switchAuth}
            style={{ color: "#6f42c1" }}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </button>
        </div>

        <div className="text-center mt-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
