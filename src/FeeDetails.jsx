import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase'; 
import { doc, getDoc } from "firebase/firestore";
import { CreditCard } from 'lucide-react';

const FeeDetails = () => {
  const [feeHistory, setFeeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeData = async () => {
      // 1. Get current user email safely
      const userEmail = auth.currentUser?.email;
      
      if (userEmail) {
        try {
          const docRef = doc(db, "students", userEmail);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // Storing the feeHistory array from Firestore
            setFeeHistory(data.feeHistory || []);
          }
        } catch (error) {
          console.error("Error fetching fee history:", error);
        }
      }
      setLoading(false);
    };

    fetchFeeData();
  }, []);

  // 2. Helper function to handle Colors and Text safely
  const getStatusStyle = (statusValue) => {
    // Convert to string and clean it up (lowercase and no spaces)
    const s = String(statusValue || "").toLowerCase().trim();

    if (s === 'paid') {
      return { 
        bg: '#e8f5e9', 
        text: '#2e7d32', 
        label: 'PAID' 
      };
    } else if (s === 'pending') {
      return { 
        bg: '#ffebee', 
        text: '#c62828', 
        label: 'PENDING' 
      };
    } else {
      return { 
        bg: '#f5f5f5', 
        text: '#616161', 
        label: statusValue || 'N/A' 
      };
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Table Data...</div>;

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#1a237e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CreditCard size={24} /> Fee Payment History
      </h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9ff', borderBottom: '2px solid #1a237e' }}>
              <th style={{ padding: '15px' }}>Month</th>
              <th style={{ padding: '15px' }}>Amount</th>
              <th style={{ padding: '15px' }}>Due Date</th>
              <th style={{ padding: '15px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {feeHistory.map((fee, index) => {
              // Get the style for each row's status
              const statusInfo = getStatusStyle(fee.status);
              
              return (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{fee.month}</td>
                  <td style={{ padding: '15px' }}>Rs. {fee.amount}</td>
                  <td style={{ padding: '15px' }}>
                    {/* Safe Date Rendering */}
                    {fee.dueDate?.toDate ? fee.dueDate.toDate().toLocaleDateString() : fee.dueDate}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '6px 16px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      background: statusInfo.bg,
                      color: statusInfo.text,
                      display: 'inline-block',
                      minWidth: '85px',
                      textAlign: 'center'
                    }}>
                      {statusInfo.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {feeHistory.length === 0 && (
          <p style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No fee records found in your profile.</p>
        )}
      </div>
    </div>
  );
};

export default FeeDetails;