import { useState, type FC } from 'react';
import './Reports.css';

export interface Transaction {
  id: string;
  name: string;
  depositAmt: number;
  refundAmt: number;
  rentAmt:number;
  checkInDate: string;
  checkOutDate: string;
  room: string;
  floor: string;
  totalAmt: number;
  bedNo:number;
  bookingUniqueId:string;
}

interface Props {
  data: Transaction[];
}

const TransactionTable: FC<Props> = ({ data }) => {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  if (data.length === 0) {
    return (
      <p style={{ textAlign: 'center', margin: '2rem 0', color: '#888' }}>
        No records found for the selected dates.
      </p>
    );
  }

  return (
    <>
      <div className="txn-table-container">
        <table className="txn-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Name</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Room (Floor)</th>
              <th>Rent Amount</th>
              <th>Deposit</th>
              <th>Refund</th>
              {/* <th>Total</th> */}
            </tr>
          </thead>
          <tbody>
            {data.map(txn => (
              <tr key={txn.id}>
                <td>
                  <p className="t-card-id" onClick={() => setSelectedTxn(txn)}>{txn.id}</p>
                </td>
                <td>
                  <h4 className="t-card-name">{txn.name}</h4>
                </td>
                <td>{txn.checkInDate}</td>
                <td>{txn.checkOutDate}</td>
                <td>{txn.room} ({txn.floor})</td>
                <td>{txn.rentAmt}</td>
                <td>₹{txn.depositAmt}</td>
                <td>₹{txn.refundAmt}</td>
                {/* <td style={{ fontWeight: '600' }}>₹{txn.totalAmt}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTxn && (
        <div className="txn-modal-overlay" onClick={() => setSelectedTxn(null)}>
          <div className="txn-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="txn-modal-header">
              <h3>Transaction Details</h3>
              <button className="txn-modal-close" onClick={() => setSelectedTxn(null)}>&times;</button>
            </div>
            <div className="txn-modal-body">
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Invoice Number</span>
                <span className="txn-modal-value">{selectedTxn.id}</span>
              </div>
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Booking Unique ID</span>
                <span className="txn-modal-value">{selectedTxn.bookingUniqueId}</span>
              </div>
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Name</span>
                <span className="txn-modal-value" style={{ textTransform: 'capitalize' }}>{selectedTxn.name}</span>
              </div>
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Check-In Date</span>
                <span className="txn-modal-value">{selectedTxn.checkInDate}</span>
              </div>
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Check-Out Date</span>
                <span className="txn-modal-value">{selectedTxn.checkOutDate}</span>
              </div>
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Room (Floor)</span>
                <span className="txn-modal-value">{selectedTxn.room} (Floor {selectedTxn.floor})</span>
              </div>
                 <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Bed No</span>
                <span className="txn-modal-value">{selectedTxn.bedNo}</span>
              </div>
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Rent Amount</span>
                <span className="txn-modal-value">₹{selectedTxn.rentAmt}</span>
              </div>
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Deposit Amount</span>
                <span className="txn-modal-value">₹{selectedTxn.depositAmt}</span>
              </div>
              <div className="txn-modal-detail-row">
                <span className="txn-modal-label">Refund Amount</span>
                <span className="txn-modal-value">₹{selectedTxn.refundAmt}</span>
              </div>
              <div className="txn-modal-detail-row" style={{ borderBottom: 'none', paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #eee' }}>
                <span className="txn-modal-label" style={{ fontWeight: 'bold', color: '#333' }}>Total Amount (Rent + Deposit - Refund)</span>
                <span className="txn-modal-value" style={{ fontSize: '1.2rem', color: '#1a1a1a' }}>₹{selectedTxn.rentAmt+selectedTxn.depositAmt-selectedTxn.refundAmt}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionTable;
