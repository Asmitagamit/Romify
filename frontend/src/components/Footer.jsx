import React from "react";
import { 
  Instagram, Twitter, Linkedin, Globe, 
  MapPin, ArrowUpRight, FileCheck, PhoneCall,
  UserCheck, ShieldCheck
} from "lucide-react";
import '../styles/footer.css';

function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="luxe-footer">
      {/* 🟢 TOP SECTION: BRAND & LINKS */}
      <div className="footer-grid">
        <div className="footer-brand-col">
          <h2 className="footer-logo">ROOMIFY</h2>
          <p className="brand-tagline">
            Connecting tenants and owners directly. Verified listings with instant digital receipts for offline payments.
          </p>
          <div className="social-stack">
            <button className="social-circle"><Instagram size={18}/></button>
            <button className="social-circle"><Twitter size={18}/></button>
            <button className="social-circle"><Linkedin size={18}/></button>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h4>For Tenants</h4>
            <a href="/search">Search PGs</a>
            <a href="/help">How to Book</a>
            <a href="/receipts">My Receipts</a>
          </div>

          <div className="footer-column">
            <h4>For Owners</h4>
            <a href="/list-pg">List Property</a>
            <a href="/owner-dashboard">Dashboard</a>
            <a href="/receipt-guide">Receipt Portal</a>
          </div>

          <div className="footer-column">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/safety">Safety Guide</a>
          </div>
        </div>
      </div>

      {/* 🟢 MIDDLE SECTION: UTILITY BAR */}
      <div className="footer-utility-bar">
        <div className="utility-left">
          <button className="utility-btn"><Globe size={14} /> English (IN)</button>
          <button className="utility-btn"><MapPin size={14} /> India</button>
        </div>
        
        <button className="back-to-top" onClick={scrollToTop}>
          Back to Top <ArrowUpRight size={14} />
        </button>
      </div>

      {/* 🟢 BOTTOM SECTION: TRUST & COPYRIGHT */}
      <div className="footer-bottom-legal">
        <div className="legal-left">
          <p>© {new Date().getFullYear()} Roomify India. All rights reserved.</p>
        </div>
        
        <div className="trust-badges">
          <span className="trust-item"><UserCheck size={14}/> Verified Owners</span>
          <span className="trust-item"><FileCheck size={14}/> Digital Receipts</span>
          <span className="trust-item"><PhoneCall size={14}/> Direct Contact</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;