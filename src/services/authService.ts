import { appClient } from "./appClient";



export const login=(payload:any)=>{
    return appClient("/authenticate",{
        method:"POST",
        body: JSON.stringify(payload),
    }) ;  
}

