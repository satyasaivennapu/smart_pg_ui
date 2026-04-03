import React, { useState } from 'react';
import './Checkin.css';
import { submitCheckin } from '../services/authService';

function Checkin() {
  const [formData, setFormData] = useState({
    floor: '',
    roomType: '',
    share: '',
    room: '',
    bed: '',
    applicantName: '',
    mobileNumber: '',
    proofType: '',
    idNumber: '',
    checkinDate: '2026-04-01',
    depositAmt: '',
    refundAmt: '',
    isRefundable: true,
    charge: '',
    idFront: null as File | null,
    idBack: null as File | null,
    applicantPic: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [fieldName]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await submitCheckin(formData);
      console.log('Submission logic', res);
      alert('Registration successful!');
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  return (
    <div className="checkin-wrapper">
      <h2 className="checkin-title">Registration</h2>
      
      <form onSubmit={handleSubmit} className="checkin-form">
        
        <div className="input-group mobile-half">
          <label>Select Floor</label>
          <select name="floor" value={formData.floor} onChange={handleChange} required>
            <option value="" disabled hidden>Floor</option>
            <option value="1">1st Floor</option>
            <option value="2">2nd Floor</option>
          </select>
        </div>
        
        <div className="input-group mobile-half">
          <label>Select Room Type</label>
          <select name="roomType" value={formData.roomType} onChange={handleChange} required>
            <option value="" disabled hidden>Room Type</option>
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
          </select>
        </div>

        <div className="input-group mobile-half">
          <label>Select Room Share</label>
          <select name="share" value={formData.share} onChange={handleChange} required>
            <option value="" disabled hidden>Share</option>
            <option value="1">1 Sharing</option>
            <option value="2">2 Sharing</option>
            <option value="3">3 Sharing</option>
          </select>
        </div>
        
        <div className="input-group mobile-half">
          <label>Select Room</label>
          <select name="room" value={formData.room} onChange={handleChange} required>
            <option value="" disabled hidden>Room</option>
            <option value="101">101</option>
            <option value="102">102</option>
          </select>
        </div>

        <div className="input-group">
          <label>Select Bed</label>
          <select name="bed" value={formData.bed} onChange={handleChange} required>
            <option value="" disabled hidden>Bed</option>
            <option value="A">Bed A</option>
            <option value="B">Bed B</option>
          </select>
        </div>

        <div className="input-group">
          <label>Applicant Name</label>
          <input type="text" name="applicantName" placeholder="Applicant Name" value={formData.applicantName} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Mobile Number</label>
          <input type="text" name="mobileNumber" placeholder="Mobile Number" value={formData.mobileNumber} onChange={handleChange} required />
        </div>

        <div className="input-group mt-2">
          <select name="proofType" value={formData.proofType} onChange={handleChange} required>
            <option value="" disabled hidden>Proof Type</option>
            <option value="Aadhar">Aadhar</option>
            <option value="PAN">PAN</option>
          </select>
        </div>

        <div className="input-group mt-2">
          <label>Id Number</label>
          <input type="text" name="idNumber" placeholder="Proof ID Number" value={formData.idNumber} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Checkin Date</label>
          <input type="date" name="checkinDate" value={formData.checkinDate} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Deposite Amt</label>
          <input type="number" name="depositAmt" placeholder="Deposit Amount" value={formData.depositAmt} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Refund Amt</label>
          <div className="refund-row">
            <input type="number" name="refundAmt" placeholder="Refund Amount" value={formData.refundAmt} onChange={handleChange} required className="refund-input" />
            <input type="checkbox" name="isRefundable" checked={formData.isRefundable} onChange={handleChange} className="refund-checkbox" />
          </div>
        </div>

        <div className="input-group">
          <label>Charge</label>
          <input type="number" name="charge" placeholder="Monthly Amount" value={formData.charge} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Sub Total</label>
          <div className="sub-total-box">
             <b>Sub Total : ₹0</b>
          </div>
        </div>

        <div className="upload-section">
          <label>Upload Documents</label>
          <div className="upload-grid">
            <div className="upload-box">
               <span className="upload-label">ID Front</span>
               <input type="file" onChange={(e) => handleFileChange(e, 'idFront')} className="file-input" />
            </div>
            <div className="upload-box">
               <span className="upload-label">ID Back</span>
               <input type="file" onChange={(e) => handleFileChange(e, 'idBack')} className="file-input" />
            </div>
            <div className="upload-box">
               <span className="upload-label">Applicant Pic</span>
               <input type="file" onChange={(e) => handleFileChange(e, 'applicantPic')} className="file-input" />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn-full">Submit</button>

      </form>
    </div>
  );
}

export default Checkin;