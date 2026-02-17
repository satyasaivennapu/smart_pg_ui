import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { login } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [form,setForm]=useState({
   userName:"",
   passWord:""
  });

  const [errors,setErrors]=useState({
   userName:"",
   passWord:""
  });

const handleChange=(e:ChangeEvent<HTMLInputElement>)=>{
     const {name,value}=e.target;

     setForm(prev=>({
      ...prev,
      [name]:value,
     }));
   }

   const validateForm=()=>{
    let valid=true;
    const newErrors = { userName: "", passWord: "" };

    if (!form.userName.trim()) {
      newErrors.userName = "Username is required";
      valid = false;
    }

    if (!form.passWord.trim()) {
      newErrors.passWord = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
   };

   const handleSubmit=async (e:React.FormEvent)=>{
    e.preventDefault();
    if(!validateForm()) return;
     console.log("Login Data:", form);
    const body={
     "userName":form.userName,
     "password":form.passWord
    }
    const response=await login(body);
    console.log('res',response);
    navigate('/dashboard');
    if(response.success){
    console.log(response.success);
    //  navigate('/dashboard');
    }else{
      alert(response.message);
    }
   
   }
 return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-96 p-8 rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Smart PG
        </h2>

        {/* Username */}
        <div className="mb-4">
          <input
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Username"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.userName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.userName}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <input
            type="passWord"
            name="passWord"
            value={form.passWord}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {errors.passWord && (
            <p className="text-red-500 text-sm mt-1">
              {errors.passWord}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
