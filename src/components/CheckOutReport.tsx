import React from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ReportsOutletContext } from './ReportsLayout';
import TransactionTable, { type Transaction } from './TransactionTable';

// Mock Data representing CheckOuts
export const checkOutTransactions: Transaction[] = [
  {
    id: 'SPGB130032600025',
    name: 'rahul',
    depositAmt: 10000,
    refundAmt: 9000,
    checkInDate: '2026-01-10',
    checkOutDate: '2026-03-10',
    room: '101 (2)',
    floor: '1',
    totalAmt: 11000
  },
  {
    id: 'SPGB140032600042',
    name: 'arjun',
    depositAmt: 5000,
    refundAmt: 4500,
    checkInDate: '2025-11-05',
    checkOutDate: '2026-03-05',
    room: '405 (1)',
    floor: '4',
    totalAmt: 5500
  }
];

const CheckOutReport: React.FC = () => {
  const { fromDate, toDate } = useOutletContext<ReportsOutletContext>();

  // In a real application, you might use fromDate and toDate to filter.
  const filteredData = checkOutTransactions.filter(txn => {
    // Example: checking if checkout date falls within range
    if (!fromDate || !toDate) return true;
    return txn.checkOutDate >= fromDate && txn.checkOutDate <= toDate;
  });

  return (
    <div className="report-list">
      <TransactionTable data={filteredData} />
    </div>
  );
};

export default CheckOutReport;