import axios from "axios";

const API_BASE = "https://consecratory-flossie-rigidly.ngrok-free.dev/api"; // change to your backend

export const login = async (data:any) => {
  try{
    const response = await axios.post(`${API_BASE}/authenticate`, data);
    return response.data;
  }catch(error:any){
    return {
      success:false,
      message:error.response?.data?.message || "Login failed"
    };
  }
};

export const submitCheckin = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/checkin`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Checkin failed"
    };
  }
};

export const processCheckIn = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/processCheckIn`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Check-in failed"
    };
  }
};

export const uploadFile = async (file: File, filename: string) => {
  try {
    const formData = new FormData();
    const renamedFile = new File([file], filename, { type: file.type });
    formData.append('image', renamedFile);

    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error: any) {
    console.error("Upload error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "File upload failed"
    };
  }
};

export const processTenant = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/tenants`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Tenant operation failed"
    };
  }
};

export const processBranch = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/branch`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Branch operation failed"
    };
  }
};

export const processUser = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/users`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "User operation failed"
    };
  }
};

export const getUserRoles = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getUserRoles`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch roles"
    };
  }
};

export const createBranchRooms = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/createBranchRooms`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Room creation failed"
    };
  }
};

export const getBranchFloors = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getBranchFloors`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch floors" };
  }
};

export const getBranchRoomTypes = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getBranchRoomTypes`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch room types" };
  }
};

export const getBranchRoomCapacity = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getBranchRoomCapacity`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch capacities" };
  }
};

export const getAvailbleRooms = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getAvailbleRooms`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch available rooms" };
  }
};

export const getAvailbleBeds = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getAvailbleBeds`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch available beds" };
  }
};

export const getCheckinReport = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getCheckinReport`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch checkin report" };
  }
};

export const getTransactions = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getTransactions`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch transactions" };
  }
};

export const getCheckoutReport = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getCheckoutReport`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch checkout report" };
  }
};

export const getDashboard = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/getDashboard`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch dashboard" };
  }
};

export const manageExpenses = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/expenses`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to manage expenses" };
  }
};

export const processCheckOut = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/processCheckOut`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Checkout failed" };
  }
};

export const addMonthlyPayment = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/addMonthlyPayment`, data);
    return response.data;
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Payment failed" };
  }
};