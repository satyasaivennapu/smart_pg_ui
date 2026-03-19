import { useState, type ChangeEvent } from "react";

import { useNavigate } from "react-router-dom";
import "./Login.css";
import { login } from "../services/authService";
import loginBg from "../assets/images/login-bg.webp";
import logo from "../assets/images/logo.png";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    userName: "",
    passWord: ""
  });

  const [errors, setErrors] = useState({
    userName: "",
    passWord: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {

    let valid = true;

    const newErrors = {
      userName: "",
      passWord: ""
    };

    if (!form.userName.trim()) {
      newErrors.userName = "Username required";
      valid = false;
    }

    if (!form.passWord.trim()) {
      newErrors.passWord = "Password required";
      valid = false;
    }

    setErrors(newErrors);

    return valid;

  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const body = {
      userName: form.userName,
      password: form.passWord
    };

    const response = await login(body);

    setLoading(false);

    if (response.success === true) {

      localStorage.setItem("username", form.userName);

      navigate("/dashboard", { replace: true });

    } else {
      alert(response.message);
    }

  };

  return (

    <div className="login-container">

      {/* LEFT SIDE */}

      <div
        className="login-left"
        style={{ backgroundImage: `url(${loginBg})` }}
      >

        <div className="overlay">

          <h1>Smart PG</h1>

          <p>
            Manage rooms, tenants and payments
            with one powerful dashboard.
          </p>

        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="login-right">

        {/* TOP LOGO */}

        <div className="top-logo">

          <img
            src={logo}
            alt="Smart PG"
            className="logo-img"
          />

        </div>


        {/* LOGIN FORM */}

        <form
          onSubmit={handleSubmit}
          className="login-card"
        >

          <div className="login-header">

            <h2>Smart PG</h2>

            <p className="login-subtitle">
              PG Management System
            </p>

          </div>

          <input
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Username"
          />

          {errors.userName &&
            <p className="error">{errors.userName}</p>
          }


          {/* PASSWORD FIELD */}

          <div className="password-field">

            <input
              type={showPassword ? "text" : "password"}
              name="passWord"
              value={form.passWord}
              onChange={handleChange}
              placeholder="Password"
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </span>

          </div>

          {errors.passWord &&
            <p className="error">{errors.passWord}</p>
          }


          <button
            type="submit"
            disabled={loading}
          >

            {loading ? "Logging in..." : "Login"}

          </button>

        </form>

      </div>

    </div>

  );

}

export default Login;