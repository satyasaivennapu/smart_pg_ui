import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import './Checkin.css';
import { 
  getBranchFloors, 
  getBranchRoomTypes, 
  getBranchRoomCapacity, 
  getAvailbleRooms, 
  getAvailbleBeds,
  processCheckIn,
  uploadFile 
} from '../services/authService';



function Checkin() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    tenantId: '',
    branchId: '',
    floor: '',
    roomType: '',
    roomCapacity: '',
    roomId: '',
    roomsDetailId: '',
    applicantName: '',
    mobileNumber: '',
    proofType: '',
    idNumber: '',
    checkinDate: new Date().toISOString().split('T')[0],
    depositAmt: '',
    refundAmt: '',
    isRefundable: true,
    charge: '',
    paymentMode: 'CASH',
    refundEligible: 0,
    idFront: null as File | null,
    idBack: null as File | null,
    applicantPic: null as File | null
  });

  const [options, setOptions] = useState({
    tenants: [] as any[],
    branches: [] as any[],
    floors: [] as any[],
    roomTypes: [] as any[],
    capacities: [] as any[],
    rooms: [] as any[],
    beds: [] as any[]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setFormData(prev => ({ 
        ...prev, 
        tenantId: parsedUser.tenant_id?.toString() || '', 
        branchId: parsedUser.branch_id?.toString() || '' 
      }));
      fetchInitialData(parsedUser);
    }
  }, []);

  const fetchInitialData = async (currentUser: any) => {
    if (!currentUser) return;
    
    // Automatically fetch floors for his branch
    const floorRes = await getBranchFloors({ 
      branchId: currentUser.branch_id, 
      userId: currentUser.id 
    });
    if (floorRes?.success) setOptions(prev => ({ ...prev, floors: floorRes.result || [] }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFloorChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const floorNo = e.target.value;
    setFormData(prev => ({ ...prev, floor: floorNo, roomType: '', roomCapacity: '', roomId: '', roomsDetailId: '' }));
    if (!user) return;
    const [typesRes, capsRes] = await Promise.all([
      getBranchRoomTypes({ branchId: formData.branchId, floorNo, userId: user.id }),
      getBranchRoomCapacity({ branchId: formData.branchId, floorNo, userId: user.id })
    ]);
    if (typesRes?.success) setOptions(prev => ({ ...prev, roomTypes: typesRes.result || [] }));
    if (capsRes?.success) setOptions(prev => ({ ...prev, capacities: capsRes.result || [] }));
  };

  const handleTypeOrCapacityChange = async (name: string, value: string) => {
    const updatedForm = { ...formData, [name]: value, roomId: '', roomsDetailId: '' };
    setFormData(updatedForm);
    if (updatedForm.floor && updatedForm.roomType && updatedForm.roomCapacity && user) {
      const res = await getAvailbleRooms({
        branchId: updatedForm.branchId,
        floorNo: updatedForm.floor,
        roomType: updatedForm.roomType,
        roomCapacity: updatedForm.roomCapacity,
        userId: user.id
      });
      if (res?.success) setOptions(prev => ({ ...prev, rooms: res.result || [] }));
    }
  };

  const handleRoomChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const rid = e.target.value;
    setFormData(prev => ({ ...prev, roomId: rid, roomsDetailId: '' }));
    if (!user) return;
    const res = await getAvailbleBeds({ branchId: formData.branchId, roomId: rid, userId: user.id });
    if (res?.success) setOptions(prev => ({ ...prev, beds: res.result || [] }));
  };

  const handleBedChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const detailId = e.target.value;
    const selectedBed = options.beds.find((b: any) => b.room_detail_id.toString() === detailId);
    
    if (selectedBed) {
      setFormData(prev => ({
        ...prev,
        roomsDetailId: detailId,
        depositAmt: selectedBed.deposit_amount ? String(selectedBed.deposit_amount) : '',
        refundAmt: selectedBed.refund_amount ? String(selectedBed.refund_amount) : '',
        charge: selectedBed.amount ? String(selectedBed.amount) : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, roomsDetailId: detailId }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [fieldName]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('User session not found. Please log in again.');
      return;
    }
    setLoading(true);

    try {
      let occupantImg = '';
      let occupantProofFrontImg = '';
      let occupantProofBackImg = '';

      const basePrefix = `${formData.branchId}_${formData.roomsDetailId}_`;

      // Sequential uploads
      if (formData.applicantPic) {
        const up = await uploadFile(formData.applicantPic, `${basePrefix}applicant.jpg`);
        if (up.success) occupantImg = up.url || up.fileName || `${basePrefix}applicant.jpg`;
      }
      if (formData.idFront) {
        const up = await uploadFile(formData.idFront, `${basePrefix}id_front.jpg`);
        if (up.success) occupantProofFrontImg = up.url || up.fileName || `${basePrefix}id_front.jpg`;
      }
      if (formData.idBack) {
        const up = await uploadFile(formData.idBack, `${basePrefix}id_back.jpg`);
        if (up.success) occupantProofBackImg = up.url || up.fileName || `${basePrefix}id_back.jpg`;
      }

      const payload = {
        tenantId: Number(formData.tenantId),
        branchId: Number(formData.branchId),
        roomId: Number(formData.roomId),
        roomsDetailId: Number(formData.roomsDetailId),
        occupantName: formData.applicantName,
        occupantPhoneNo: formData.mobileNumber,
        occupantProofType: formData.proofType,
        occupantProofNo: formData.idNumber,
        occupantImg,
        occupantProofFrontImg,
        occupantProofBackImg,
        checkInDate: formData.checkinDate,
        depositAmount: Number(formData.depositAmt),
        refundAmount: Number(formData.refundAmt),
        monthlyAmount: Number(formData.charge),
        paymentMode: formData.paymentMode,
        userId: user.id,
        refundEligible: formData.isRefundable ? 1 : 0
      };

      console.log('Submitting Registration Payload:', payload);
      const res = await processCheckIn(payload);

      if (res?.success) {
        alert('Registration successful!');
        window.location.reload();
      } else {
        alert(`Registration failed: ${res?.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-wrapper">
      <h2 className="checkin-title">Registration</h2>
      
      <form onSubmit={handleSubmit} className="checkin-form">
        
        {/* Branch Floors Grid */}
        <div className="input-group mobile-half">
          <label>Select Floor</label>
          <select name="floor" value={formData.floor} onChange={handleFloorChange} required disabled={!formData.branchId}>
            <option value="" disabled hidden>Floor</option>
            {options.floors.map((f: any) => <option key={f.floor_no} value={f.floor_no}>{f.floor_no}{Number(f.floor_no) === 1 ? 'st' : Number(f.floor_no) === 2 ? 'nd' : 'th'} Floor</option>)}
          </select>
        </div>
        
        <div className="input-group mobile-half">
          <label>Select Room Type</label>
          <select name="roomType" value={formData.roomType} onChange={(e) => handleTypeOrCapacityChange('roomType', e.target.value)} required disabled={!formData.floor}>
            <option value="" disabled hidden>Room Type</option>
            {options.roomTypes.map((t: any) => <option key={t.room_type} value={t.room_type}>{t.room_type}</option>)}
          </select>
        </div>

        <div className="input-group mobile-half">
          <label>Select Room Share</label>
          <select name="roomCapacity" value={formData.roomCapacity} onChange={(e) => handleTypeOrCapacityChange('roomCapacity', e.target.value)} required disabled={!formData.floor}>
            <option value="" disabled hidden>Share</option>
            {options.capacities.map((c: any) => <option key={c.room_capacity} value={c.room_capacity}>{c.room_capacity} Sharing</option>)}
          </select>
        </div>
        
        <div className="input-group mobile-half">
          <label>Select Room</label>
          <select name="roomId" value={formData.roomId} onChange={handleRoomChange} required disabled={!formData.roomCapacity || !formData.roomType}>
            <option value="" disabled hidden>Room</option>
            {options.rooms.map((r: any) => <option key={r.room_id} value={r.room_id}>{r.room_no}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label>Select Bed</label>
          <select name="roomsDetailId" value={formData.roomsDetailId} onChange={handleBedChange} required disabled={!formData.roomId}>
            <option value="" disabled hidden>Bed</option>
            {options.beds.map((b: any) => <option key={b.room_detail_id} value={b.room_detail_id}>Bed {b.bed_no}</option>)}
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
          <label>Proof Type</label>
          <select name="proofType" value={formData.proofType} onChange={handleChange} required>
            <option value="" disabled hidden>Proof Type</option>
            <option value="Aadhar">Aadhar</option>
            <option value="PAN">PAN</option>
            <option value="Voter ID">Voter ID</option>
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
          <label>Deposit Amt</label>
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
          <label>Monthly Amount</label>
          <input type="number" name="charge" placeholder="Monthly Amount" value={formData.charge} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Payment Mode</label>
          <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
            <option value="CASH">CASH</option>
            <option value="UPI">UPI</option>
            <option value="CARD">CARD</option>
            <option value="BANK">BANK TRANSFER</option>
          </select>
        </div>

        <div className="input-group">
          <label>Sub Total</label>
          <div className="sub-total-box">
             <b>Sub Total : ₹{(Number(formData.depositAmt) || 0) + (Number(formData.charge) || 0)}</b>
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

        <button type="submit" className="submit-btn-full" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>

      </form>
    </div>
  );
}

export default Checkin;