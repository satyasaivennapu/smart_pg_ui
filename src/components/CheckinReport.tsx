import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ReportsOutletContext } from './ReportsLayout';
import TransactionTable, { type Transaction } from './TransactionTable';

// Mock Data representing CheckIns
export const checkInTransactions: Transaction[] = [
  {
    id: 'SPGB124032600020',
    name: 'nitin',
    depositAmt: 8000,
    refundAmt: 5000,
    checkInDate: '2026-03-24',
    checkOutDate: '2026-04-23',
    room: '301 (1)',
    floor: '3',
    totalAmt: 8500
  },
  {
    id: 'SPGB119032600017',
    name: 'narayana',
    depositAmt: 8000,
    refundAmt: 0,
    checkInDate: '2026-03-19',
    checkOutDate: '2026-04-18',
    room: '203 (3)',
    floor: '2',
    totalAmt: 8500
  }
];

const CheckinReport: React.FC = () => {
  const { fromDate, toDate } = useOutletContext<ReportsOutletContext>();

  // In a real application, you might use fromDate and toDate to filter the transactions.
  // Example mock filter just to show it works:
  const filteredData = checkInTransactions.filter(txn => {
    // Basic date comparison logic (assuming YYYY-MM-DD format)
    if (!fromDate || !toDate) return true;
    return txn.checkInDate >= fromDate && txn.checkInDate <= toDate;
  });

  return (
    <div className="report-list">
      <TransactionTable data={filteredData} />
    </div>
  );
};

export default CheckinReport;