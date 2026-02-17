import React, { useState } from 'react'
import './Checkin.css'
function Checkin() {
  const [formData,setFormdata]=useState({
    guestName:"",
    mobile :"",
    roomNo:""
    })
  return (
    <div>Checkin</div>
  )
}

export default Checkin