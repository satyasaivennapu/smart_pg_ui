import React, { useState, useEffect } from 'react';
import { processTenant, processBranch, createBranchRooms } from '../services/authService';
import './Rooms.css';

interface Room {
  room_no: number;
  capacity: number;
  type: string;
  amount: number;
  deposit: number;
  refund: number;
}

interface Floor {
  floor_no: number;
  rooms: Room[];
}

interface Tenant { id: number; name: string; }
interface Branch { id: number; name: string; tenantId: number; }

export default function Rooms() {
  const [selectedTenant, setSelectedTenant] = useState<number>(0);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const [bedAvailability, setBedAvailability] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const userId = 101; 
  
  const [floors, setFloors] = useState<Floor[]>([
    {
      floor_no: 1,
      rooms: [{ room_no: 101, capacity: 4, type: 'NON_AC', amount: 8000, deposit: 5000, refund: 3000 }]
    }
  ]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const res = await processBranch({ crudType: 'GET', userId });
    if (res?.success && res.result?.length > 0) {
      const firstBranch = res.result[0];
      setSelectedTenant(Number(firstBranch.tenant_id || firstBranch.tenantId));
      setSelectedBranch(Number(firstBranch.id));
    }
  };

  const addFloor = () => {
    const nextFloorNo = floors.length > 0 ? Math.max(...floors.map(f => f.floor_no)) + 1 : 1;
    setFloors([...floors, {
      floor_no: nextFloorNo,
      rooms: [{ room_no: nextFloorNo * 100 + 1, capacity: 4, type: 'NON_AC', amount: 8000, deposit: 5000, refund: 3000 }]
    }]);
  };

  const removeFloor = (index: number) => {
    setFloors(floors.filter((_, i) => i !== index));
  };

  const addRoom = (floorIndex: number) => {
    const newFloors = [...floors];
    const currentRooms = newFloors[floorIndex].rooms;
    const lastRoomNo = currentRooms.length > 0 ? Math.max(...currentRooms.map(r => r.room_no)) : newFloors[floorIndex].floor_no * 100;
    
    newFloors[floorIndex].rooms.push({
      room_no: lastRoomNo + 1,
      capacity: 4,
      type: 'NON_AC',
      amount: 8000,
      deposit: 5000,
      refund: 3000
    });
    setFloors(newFloors);
  };

  const removeRoom = (floorIndex: number, roomIndex: number) => {
    const newFloors = [...floors];
    newFloors[floorIndex].rooms = newFloors[floorIndex].rooms.filter((_, i) => i !== roomIndex);
    setFloors(newFloors);
  };

  const handleRoomChange = (floorIndex: number, roomIndex: number, field: keyof Room, value: any) => {
    const newFloors = [...floors];
    (newFloors[floorIndex].rooms[roomIndex] as any)[field] = field === 'type' ? value : Number(value);
    setFloors(newFloors);
  };

  const handleFloorNoChange = (floorIndex: number, value: string) => {
    const newFloors = [...floors];
    newFloors[floorIndex].floor_no = Number(value);
    setFloors(newFloors);
  };

  const handleSubmit = async () => {
    if (!selectedTenant || !selectedBranch) {
      alert("No active Branch/Tenant found for this user.");
      return;
    }

    setLoading(true);
    const payload = {
      tenantId: selectedTenant,
      branchId: selectedBranch,
      bedAvailability,
      userId,
      floors
    };

    console.log("Submitting Rooms Payload:", payload);
    const res = await createBranchRooms(payload);

    if (res?.success) {
      alert("All Floors, Rooms & Beds Created Successfully!");
    } else {
      alert(`Error: ${res?.message || 'Failed to create rooms'}`);
    }
    setLoading(false);
  };

  return (
    <div className="rooms-container">
      <div className="rooms-header">
        <h2 className="rooms-title">Batch Create Rooms</h2>
      </div>

      {floors.map((floor, fIdx) => (
        <div key={fIdx} className="floor-card">
          <div className="floor-header">
            <div className="floor-number-title">
              <div className="input-group" style={{ width: '100px', marginBottom: 0 }}>
                <input 
                  type="number" 
                  value={floor.floor_no} 
                  onChange={(e) => handleFloorNoChange(fIdx, e.target.value)}
                  placeholder="Floor #"
                />
              </div>
              <h3>Floor Details</h3>
            </div>
            <button className="btn-remove" onClick={() => removeFloor(fIdx)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>

          <div className="rooms-list">
            {floor.rooms.map((room, rIdx) => (
              <div key={rIdx} className="room-row-modern" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) 40px', gap: '15px', marginBottom: '20px', alignItems: 'end' }}>
                <div className="input-group">
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Room No</label>
                  <input type="number" value={room.room_no} onChange={(e) => handleRoomChange(fIdx, rIdx, 'room_no', e.target.value)} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Capacity</label>
                  <input type="number" value={room.capacity} onChange={(e) => handleRoomChange(fIdx, rIdx, 'capacity', e.target.value)} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Room Type</label>
                  <select value={room.type} onChange={(e) => handleRoomChange(fIdx, rIdx, 'type', e.target.value)}>
                    <option value="AC">AC</option>
                    <option value="NON_AC">Non-AC</option>
                  </select>
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Amount</label>
                  <input type="number" value={room.amount} onChange={(e) => handleRoomChange(fIdx, rIdx, 'amount', e.target.value)} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Deposit Amt</label>
                  <input type="number" value={room.deposit} onChange={(e) => handleRoomChange(fIdx, rIdx, 'deposit', e.target.value)} />
                </div>
                <div className="input-group">
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Refund Amt</label>
                  <input type="number" value={room.refund} onChange={(e) => handleRoomChange(fIdx, rIdx, 'refund', e.target.value)} />
                </div>
                <button className="btn-remove" onClick={() => removeRoom(fIdx, rIdx)} style={{ marginBottom: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
            <button className="add-room-btn" onClick={() => addRoom(fIdx)}>
              + Add Room to Floor {floor.floor_no}
            </button>
          </div>
        </div>
      ))}

      <div className="add-floor-section">
        <button className="btn-add-floor" onClick={addFloor}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Floor
        </button>
      </div>

      <div className="form-actions">
        <button className="btn-save-all" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create All Floors & Rooms'}
        </button>
      </div>
    </div>
  );
}