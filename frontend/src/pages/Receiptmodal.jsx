import React from 'react';
import html2pdf from 'html2pdf.js';
import { X, Download } from "lucide-react";
import "../styles/receiptmodal.css";

const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handleDownload = () => {
    const element = document.getElementById('printable-receipt');
    const options = {
      margin: 0.5,
      filename: `Receipt_${receipt.receipt_no}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="luxe-modal-overlay" onClick={onClose}>
      <div className="receipt-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-modal-actions">
          <div className="receipt-info">
            <span className="receipt-id">#{receipt.receipt_no}</span>
            <p>Official Rent Receipt</p>
          </div>
          <div className="btn-group">
            <button className="download-pdf-btn" onClick={handleDownload}>
              <Download size={16} /> Download PDF
            </button>
            <button className="close-modal-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

       {/* --- Replace from here --- */}
<div id="printable-receipt" className="receipt-paper">
  <div style={{ textAlign: 'center', borderBottom: '2px solid #132B6B', paddingBottom: '10px' }}>
    <h1 style={{ letterSpacing: '4px', color: '#132B6B', margin: 0 }}>RENT RECEIPT</h1>
    <p style={{ color: '#B87333', fontSize: '0.7rem', fontWeight: '800', marginTop: '5px' }}>OFFICIAL VERIFIED DOCUMENT</p>
  </div>
  
  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
    <div>
      <p style={{ margin: '2px 0' }}><strong>Owner:</strong> {receipt.owner}</p>
      <p style={{ margin: '2px 0' }}><strong>Tenant:</strong> {receipt.tenant_name}</p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <p style={{ margin: '2px 0' }}><strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}</p>
      <p style={{ margin: '2px 0' }}><strong>Property:</strong> {receipt.property_address}</p>
    </div>
  </div>

  {/* 🟢 Distributed Bill Breakdown Section */}
  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginTop: '25px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.8rem', color: '#64748b' }}>
      <span>DESCRIPTION</span>
      <span>AMOUNT</span>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.95rem' }}>
      <span>Monthly Base Rent</span>
      <span>₹{receipt.rent_amount}</span>
    </div>

    {/* Loops through Water, WiFi, Electricity, etc. */}
    {receipt.charges && Object.entries(receipt.charges).map(([key, val]) => (
      val > 0 && (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.95rem', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ textTransform: 'capitalize' }}>{key} Bill</span>
          <span>₹{val}</span>
        </div>
      )
    ))}

    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      fontWeight: '900', 
      marginTop: '15px', 
      borderTop: '2.5px solid #132B6B', 
      paddingTop: '10px', 
      color: '#132B6B', 
      fontSize: '1.1rem' 
    }}>
      <span>GRAND TOTAL PAID</span>
      <span>₹{receipt.total_amount}</span>
    </div>
  </div>

  <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end' }}>
    <div style={{ textAlign: 'center' }}>
      {receipt.signature && (
        <img 
          src={receipt.signature} 
          alt="Signature" 
          crossOrigin="anonymous" 
          style={{ maxHeight: '60px', display: 'block', marginLeft: 'auto', filter: 'grayscale(1)', mixBlendMode: 'multiply' }} 
        />
      )}
      <div style={{ borderTop: '1px solid #000', width: '150px', marginTop: '5px', marginLeft: 'auto' }}></div>
      <p style={{ fontSize: '0.7rem', fontWeight: '700', marginTop: '5px' }}>AUTHORIZED SIGNATURE</p>
    </div>
  </div>
</div>
{/* --- To here --- */}
      </div>
    </div>
  );
};

export default ReceiptModal; // ✅ THIS IS THE EXPORT REACT IS LOOKING FOR