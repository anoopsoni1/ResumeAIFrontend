import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./slice/user.slice";
import { useNavigate } from "react-router-dom";
import { FaFileMedical } from "react-icons/fa";
import { Link } from "react-router-dom";
export default function Login() {
  const [email, setemail] = useState("");
   const [password, setpassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate() ;
const dispatch = useDispatch() ;

 const handleChange = (e) => {
  if (e.target.name === "email") {
    setemail(e.target.value);
  } else if (e.target.name === "password") {
    setpassword(e.target.value);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
      setError("");

    try {
      const res = await fetch("http://localhost:5000/api/v1/user/login" , {
        method : "POST" ,
        credentials : "include" ,
        headers : {
            "Content-Type" : "application/json",
        },
           body : JSON.stringify({email , password})
      })

         const data = await res.json() ;
       
         localStorage.setItem("accessToken", data.data.accessToken);
        dispatch(setUser(data.data.user));
         alert("Login Succesfully")
          navigate("/dashboard")
          
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
    
      <div className="bg-black">
    <header className="w-full  backdrop-blur-3xl bg-amber-50/5 sticky top-0 z-30">
      <div className="mx-auto flex items-center justify-between px-4 py-3 md:py-4">
       
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600">
            <span className="text-lg font-semibold text-white"><FaFileMedical /></span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
           RESUME AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-sm font-medium text-white p-2 px-2 rounded-full bg-indigo-600 md:inline-block shadow-md shadow-indigo-500/30 hover:bg-indigo-700">
            Sign In
          </Link>
          <Link to="/register"  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700">
            Get Started
          </Link>
        </div>
      </div>
    </header>
    </div>
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-8 rounded-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && <p className="text-red-600 text-center mb-3">{error}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg mt-2 hover:bg-blue-700">
          Login
        </button>

        <p className="mt-4 text-center text-sm">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 underline">
            Register
          </a>
        </p>
      </form>
    </div>
    </>
  );
}
