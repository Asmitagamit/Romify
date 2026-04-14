import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Printer, Download, ArrowLeft } from "lucide-react";
import "../styles/Receipt.css";

const ReceiptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/receipts/request/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Receipt fetch error", err);
      }
    };
    fetchReceipt();
  }, [id]);

  if (!data) return <div className="luxe-loader"></div>;

  return (
    <div className="receipt-view-root">
      {/* CONTROL BAR */}
      <div className="receipt-controls no-print">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
        <div className="control-group">
          <button className="action-btn print" onClick={() => window.print()}><Printer size={18}/> Print</button>
          <button className="action-btn download"><Download size={18}/> Save PDF</button>
        </div>
      </div>

      {/* DOCUMENT STAGE */}
      <div className="document-stage">
        <div className="luxe-receipt-paper">
          <div className="receipt-watermark">ROMMIFY</div>
          
          <header className="receipt-header">
            <div className="branding">
              <h1>ROMMIFY</h1>
              <p>Premium Living Solutions</p>
            </div>
            <div className="receipt-meta">
              <span className="type">OFFICIAL RENT RECEIPT</span>
              <span className="number">#{data.receipt_no}</span>
            </div>
          </header>

          <div className="receipt-body">
            <div className="data-row">
              <div className="data-field">
                <label>Date of Issue</label>
                <p>{new Date(data.date).toLocaleDateString()}</p>
              </div>
              <div className="data-field text-right">
                <label>Property Owner</label>
                <p>{data.owner}</p>
              </div>
            </div>

            <div className="narrative">
              <p>Received with thanks from <strong>{data.tenant_name}</strong>, the sum of <strong>₹{data.total_amount}</strong> as rental payment for the premises located at:</p>
              <address>{data.property_address}</address>
            </div>

            <div className="charges-table">
              <div className="table-header">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="table-row"><span>Monthly Base Rent</span><span>₹{data.rent_amount}</span></div>
              {Object.entries(data.charges).map(([key, val]) => (
                val > 0 && <div className="table-row" key={key}><span>{key.charAt(0).toUpperCase() + key.slice(1)} Charges</span><span>₹{val}</span></div>
              ))}
              <div className="table-total">
                <span>Total Amount Paid</span>
                <span>₹{data.total_amount}</span>
              </div>
            </div>
          </div>

          <footer className="receipt-footer">
            <div className="signature-area">
              {data.signature && <img src={data.signature} alt="Signature" />}
              <div className="sig-line"></div>
              <p>Authorized Signature</p>
            </div>
            <div className="footer-note">
              <p>This is a computer-generated receipt and does not require a physical stamp for digital verification.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ReceiptView;