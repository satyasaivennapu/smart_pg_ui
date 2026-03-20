const BASE_URL = import.meta.env.BACK_END_API_URL || "https://consecratory-flossie-rigidly.ngrok-free.dev/api";

export const appClient=async(
    url:string,
    options: RequestInit = {}
)=>{

 const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

    const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

   const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
};