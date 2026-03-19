import axios from "axios";

const API_BASE = "http://localhost:3000/api"; // change to your backend

export const login = async (data:any) => {

  try{

    const response = await axios.post(
      `${API_BASE}/authenticate`,
      data
    );

    return response.data;

  }catch(error:any){

    return {
      success:false,
      message:error.response?.data?.message || "Login failed"
    };

  }

};