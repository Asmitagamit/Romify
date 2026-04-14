import { useState, useMemo } from "react";

import { Link } from "react-router-dom"; 

// If you also need the logo for that nav, make sure it's imported too:
import logo from "../assets/original.png";

import "../styles/help.css";


// ─── Inline SVG Icons ──────────────────────────────────────
const Ico = ({ path, size = 18, vb = "0 0 24 24", sw = 2 }) => (
  <svg width={size} height={size} viewBox={vb} fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(path) ? path.map((d, i) => <path key={i} d={d} />) : <path d={path} />}
  </svg>
);

const Icons = {
  Search:   <Ico path="M11 11a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" />,
  X:        <Ico path="M18 6L6 18M6 6l12 12" />,
  Chevron:  <Ico path="M6 9l6 6 6-6" />,
  Arrow:    <Ico path="M5 12h14M12 5l7 7-7 7" />,
  Back:     <Ico path="M19 12H5M12 19l-7-7 7-7" />,
  User:     <Ico path={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8"]} />,
  Building: <Ico path={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]} />,
  Card:     <Ico path={["M1 4h22v16H1z","M1 10h22"]} />,
  Shield:   <Ico path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  Receipt:  <Ico path={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]} />,
  Phone:    <Ico path="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />,
  Cash:     <Ico path="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  Chat:     <Ico path="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  Mail:     <Ico path={["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"]} />,
  Book:     <Ico path={["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"]} />,
  Lock:     <Ico path={["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"]} />,
  Download: <Ico path={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} />,
  Check:    <Ico path="M20 6L9 17l-5-5" />,
  Warn:     <Ico path={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"]} />,
};

// ─── Help Articles Data ────────────────────────────────────
const ARTICLES = [
  // TENANT
  {
    id: "t1", category: "tenant", catLabel: "Tenant Guide",
    title: "How do I register and log in?",
    tags: ["register", "login", "account", "otp", "phone"],
    summary: "Create a verified Roomify account using your mobile number.",
    content: [
      { type: "step", num: 1, text: "Visit Roomify and click Sign Up." },
      { type: "step", num: 2, text: "Enter your name, email, and mobile number." },
      { type: "step", num: 3, text: "You'll receive an OTP on your phone — enter it to verify." },
      { type: "step", num: 4, text: "Set a password and complete your profile." },
      { type: "step", num: 5, text: "Log in anytime with your phone number + password." },
      { type: "note", text: "Phone verification is mandatory. It prevents fake requests and protects owners." },
    ],
  },
  {
    id: "t2", category: "tenant", catLabel: "Tenant Guide",
    title: "How do I search and filter PGs?",
    tags: ["search", "filter", "location", "price", "amenities", "room type"],
    summary: "Use powerful filters to find PGs that match your needs.",
    content: [
      { type: "step", num: 1, text: "From the home screen, enter your city or area in the search bar." },
      { type: "step", num: 2, text: "Apply filters: Price range (₹/month), Room type (Single / Double / Triple), Gender preference, Amenities (WiFi, AC, meals, laundry)." },
      { type: "step", num: 3, text: "Browse the PG cards — each shows price, photos, and distance." },
      { type: "step", num: 4, text: "Click any card to see full details before requesting." },
    ],
  },
  {
    id: "t3", category: "tenant", catLabel: "Tenant Guide",
    title: "How do I request a booking?",
    tags: ["booking", "request", "form", "move-in", "room"],
    summary: "Submit a booking request — no payment required upfront.",
    content: [
      { type: "step", num: 1, text: "Open a PG listing and click Request Booking." },
      { type: "step", num: 2, text: "Fill the booking form: your name, phone number, preferred room type, and move-in date." },
      { type: "step", num: 3, text: "Review and submit. You'll see a Pending status immediately." },
      { type: "step", num: 4, text: "The owner reviews your request and will Approve or Reject it." },
      { type: "step", num: 5, text: "You can track status in My Bookings — Pending / Approved / Rejected." },
      { type: "note", text: "You cannot submit duplicate requests for the same PG. Multiple different PGs are allowed." },
    ],
  },
  {
    id: "t4", category: "tenant", catLabel: "Tenant Guide",
    title: "How does payment work as a tenant?",
    tags: ["payment", "upi", "cash", "offline", "bank transfer"],
    summary: "All payments happen offline — directly with the owner.",
    content: [
      { type: "text", text: "Roomify does not collect or process any payment. Once your booking is approved, you coordinate directly with the owner." },
      { type: "step", num: 1, text: "Owner approves your request." },
      { type: "step", num: 2, text: "Contact the owner (their number is visible after approval)." },
      { type: "step", num: 3, text: "Pay via UPI (GPay / PhonePe / Paytm), Cash, or Bank Transfer." },
      { type: "step", num: 4, text: "Owner logs the payment in the system and generates your PDF receipt." },
      { type: "step", num: 5, text: "Download your receipt from My Bookings." },
      { type: "note", text: "Always save your PDF receipt — it's your proof of rent payment." },
    ],
  },
  {
    id: "t5", category: "tenant", catLabel: "Tenant Guide",
    title: "What is the booking status and what does it mean?",
    tags: ["status", "pending", "approved", "rejected", "booking"],
    summary: "Track your request status in real time.",
    content: [
      { type: "badge", label: "Pending", color: "amber", text: "Your request has been submitted. The owner has not responded yet." },
      { type: "badge", label: "Approved", color: "green", text: "Owner accepted your request. Contact them to arrange payment and move-in." },
      { type: "badge", label: "Rejected", color: "red", text: "Owner declined your request. You can search other PGs and request again." },
      { type: "note", text: "Requests with no owner response for 72 hours auto-expire. You may re-submit." },
    ],
  },
  // OWNER
  {
    id: "o1", category: "owner", catLabel: "Owner Guide",
    title: "How do I list my PG on Roomify?",
    tags: ["list", "listing", "pg", "photos", "owner", "add"],
    summary: "Get your PG live in minutes — free to list.",
    content: [
      { type: "step", num: 1, text: "Log in and go to Owner Dashboard → My Listings → Add New PG." },
      { type: "step", num: 2, text: "Fill in PG name, address, and locality." },
      { type: "step", num: 3, text: "Add room types with pricing (Single/Double/Triple, AC/Non-AC)." },
      { type: "step", num: 4, text: "Upload photos (min. 3 recommended for better visibility)." },
      { type: "step", num: 5, text: "Add house rules, amenities, and available dates." },
      { type: "step", num: 6, text: "Submit — your listing goes live immediately after review." },
    ],
  },
  {
    id: "o2", category: "owner", catLabel: "Owner Guide",
    title: "How do I manage incoming booking requests?",
    tags: ["requests", "approve", "reject", "dashboard", "owner"],
    summary: "View, call, approve, or reject tenant requests from your dashboard.",
    content: [
      { type: "step", num: 1, text: "Go to Owner Dashboard → Booking Requests." },
      { type: "step", num: 2, text: "Each request card shows: Tenant name, Phone number, Room type requested, Desired move-in date." },
      { type: "step", num: 3, text: "Click the Call button to call the tenant directly and verify details offline." },
      { type: "step", num: 4, text: "Click Approve ✅ to confirm the booking — tenant is notified instantly." },
      { type: "step", num: 5, text: "Click Reject ❌ if the room isn't available — tenant can search elsewhere." },
      { type: "note", text: "Respond within 72 hours. Unanswered requests auto-expire to keep tenants unblocked." },
    ],
  },
  {
    id: "o3", category: "owner", catLabel: "Owner Guide",
    title: "How do I log payment details after receiving rent?",
    tags: ["payment", "log", "upi", "cash", "bank", "owner", "record"],
    summary: "Record the payment mode and amount after the tenant pays offline.",
    content: [
      { type: "step", num: 1, text: "Go to Booking Requests → Approved tab → find the tenant." },
      { type: "step", num: 2, text: "Click Log Payment." },
      { type: "step", num: 3, text: "Enter: Amount received (₹), Payment mode (UPI / Cash / Bank Transfer), Transaction ID (optional, for UPI/Bank)." },
      { type: "step", num: 4, text: "Click Save Payment." },
      { type: "step", num: 5, text: "The Generate Receipt button is now unlocked." },
      { type: "note", text: "Payment is logged as 'Manual' since it happens offline. This is normal and expected." },
    ],
  },
  {
    id: "o4", category: "owner", catLabel: "Owner Guide",
    title: "How do I generate a PDF receipt for the tenant?",
    tags: ["receipt", "pdf", "generate", "download", "owner"],
    summary: "One-click PDF receipt generation after payment is logged.",
    content: [
      { type: "step", num: 1, text: "After logging payment, click Generate Receipt on the booking card." },
      { type: "step", num: 2, text: "The system auto-fills: Tenant name, PG name, Owner name, Room type, Booking & move-in date, Amount paid, Payment mode, Transaction ID, Date & time of receipt." },
      { type: "step", num: 3, text: "A PDF is generated and available for both you and the tenant to download." },
      { type: "step", num: 4, text: "Tenant can access their receipt from My Bookings → Download Receipt." },
      { type: "note", text: "Receipts are marked MANUAL to indicate offline payment — this is legally traceable." },
    ],
  },
  // PAYMENT
  {
    id: "p1", category: "payment", catLabel: "Payments & Receipts",
    title: "What payment methods are accepted?",
    tags: ["payment", "upi", "cash", "bank", "neft", "gpay"],
    summary: "All payments are offline — UPI, Cash, or Bank Transfer.",
    content: [
      { type: "text", text: "Roomify has no payment gateway. All transactions happen directly between tenant and owner. Supported modes:" },
      { type: "badge", label: "UPI", color: "blue", text: "GPay, PhonePe, Paytm — instant digital transfer. Recommended for easy tracking." },
      { type: "badge", label: "Cash", color: "green", text: "Hand-to-hand payment at the PG. No transaction ID needed." },
      { type: "badge", label: "Bank Transfer", color: "violet", text: "NEFT / IMPS for larger deposits. Share account details securely." },
      { type: "note", text: "Roomify is not responsible for offline transactions. Always get a receipt generated through the platform." },
    ],
  },
  {
    id: "p2", category: "payment", catLabel: "Payments & Receipts",
    title: "What does a Roomify receipt contain?",
    tags: ["receipt", "pdf", "fields", "proof", "download"],
    summary: "A detailed PDF receipt with 10 fields — your official rent record.",
    content: [
      { type: "text", text: "Every generated receipt includes:" },
      { type: "list", items: ["Tenant Name", "PG Name", "Owner Name", "Room Type", "Booking Date", "Move-in Date", "Amount Paid (₹)", "Payment Mode (UPI/Cash/Bank)", "Transaction ID (optional)", "Date & Time of Receipt Generation"] },
      { type: "note", text: "The receipt is marked MANUAL — indicating offline payment — and is legally traceable." },
    ],
  },
  {
    id: "p3", category: "payment", catLabel: "Payments & Receipts",
    title: "What if there's a payment dispute?",
    tags: ["dispute", "problem", "payment", "fraud", "support"],
    summary: "Steps to resolve a payment issue between tenant and owner.",
    content: [
      { type: "step", num: 1, text: "Check your PDF receipt — it's the primary proof of payment." },
      { type: "step", num: 2, text: "If the receipt was not generated, contact the owner directly with your UPI/bank transaction ID." },
      { type: "step", num: 3, text: "If unresolved, raise a support ticket via Help Desk → Contact Support." },
      { type: "step", num: 4, text: "Roomify will review the booking record, payment log, and receipts on file." },
      { type: "note", text: "Roomify mediates but is not a payment processor. Always generate receipts immediately after payment." },
    ],
  },
  // ACCOUNT
  {
    id: "a1", category: "account", catLabel: "Account & Security",
    title: "How do I reset my password?",
    tags: ["password", "reset", "forgot", "login", "account"],
    summary: "Reset your password via OTP in under a minute.",
    content: [
      { type: "step", num: 1, text: "On the Login page, click Forgot Password." },
      { type: "step", num: 2, text: "Enter your registered mobile number." },
      { type: "step", num: 3, text: "Enter the OTP sent to your phone." },
      { type: "step", num: 4, text: "Set a new password." },
      { type: "step", num: 5, text: "Log in with your new credentials." },
    ],
  },
  {
    id: "a2", category: "account", catLabel: "Account & Security",
    title: "Why is phone verification required?",
    tags: ["phone", "otp", "verification", "security", "fake"],
    summary: "Phone OTP ensures every user on Roomify is real.",
    content: [
      { type: "text", text: "Roomify requires mobile OTP verification during registration because:" },
      { type: "list", items: ["Prevents fake booking requests that waste owners' time", "Ensures tenants are contactable for offline coordination", "Protects both parties in disputes", "Reduces spam listings from fraudulent owners"] },
      { type: "note", text: "Your phone number is only visible to the owner after they approve your booking request." },
    ],
  },
];

const CATEGORIES = [
  { id: "all",     label: "All Topics",           icon: "Book",     color: "gray" },
  { id: "tenant",  label: "Tenant Guide",          icon: "User",     color: "blue" },
  { id: "owner",   label: "Owner Guide",           icon: "Building", color: "violet" },
  { id: "payment", label: "Payments & Receipts",   icon: "Receipt",  color: "emerald" },
  { id: "account", label: "Account & Security",    icon: "Lock",     color: "rose" },
];

const COLOR = {
  gray:    { bg: "cat-gray",    icon: "icon-gray" },
  blue:    { bg: "cat-blue",    icon: "icon-blue" },
  violet:  { bg: "cat-violet",  icon: "icon-violet" },
  emerald: { bg: "cat-emerald", icon: "icon-emerald" },
  rose:    { bg: "cat-rose",    icon: "icon-rose" },
  amber:   "status-amber",
  green:   "status-green",
  red:     "status-red",
};

// ─── Article Detail View ───────────────────────────────────
function HelpDashboard({ article, onBack }) {
  return (
    <div className="article-detail">
      <button className="back-btn" onClick={onBack}>
        {Icons.Back} Back to results
      </button>
      <div className="article-cat-label">{article.catLabel}</div>
      <h1 className="article-title">{article.title}</h1>
      <p className="article-summary">{article.summary}</p>
      <div className="article-divider" />
      <div className="article-body">
        {article.content.map((block, i) => {
          if (block.type === "step") return (
            <div key={i} className="content-step">
              <div className="step-circle">{block.num}</div>
              <p>{block.text}</p>
            </div>
          );
          if (block.type === "note") return (
            <div key={i} className="content-note">
              <span className="note-icon">{Icons.Warn}</span>
              <p>{block.text}</p>
            </div>
          );
          if (block.type === "badge") return (
            <div key={i} className={`content-badge badge-${block.color}`}>
              <span className="badge-label">{block.label}</span>
              <p>{block.text}</p>
            </div>
          );
          if (block.type === "list") return (
            <ul key={i} className="content-list">
              {block.items.map((item, j) => (
                <li key={j}><span>{Icons.Check}</span>{item}</li>
              ))}
            </ul>
          );
          return <p key={i} className="content-text">{block.text}</p>;
        })}
      </div>
    </div>
  );
}

// ─── Article Card ──────────────────────────────────────────
function ArticleCard({ article, onClick }) {
  const cat = CATEGORIES.find(c => c.id === article.category);
  const c = COLOR[cat?.color || "gray"];
  return (
    <button className="article-card" onClick={onClick}>
      <div className="article-card-top">
        <span className={`article-cat-pill ${c.bg}`}>{article.catLabel}</span>
      </div>
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
      <span className="article-arrow">{Icons.Arrow}</span>
    </button>
  );
}

// ─── Main HelpDesk ─────────────────────────────────────────
export default function HelpDesk() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openArticle, setOpenArticle] = useState(null);

  const filtered = useMemo(() => {
    let list = ARTICLES;
    if (activeCategory !== "all") list = list.filter(a => a.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some(t => t.includes(q))
      );
    }
    return list;
  }, [query, activeCategory]);

  if (openArticle) {
    return (
      <div className="hd-root">
        <HelpNav />
        <div className="hd-container">
          <ArticleDetail article={openArticle} onBack={() => setOpenArticle(null)} />
        </div>
        <HelpFooter />
      </div>
    );
  }

  return (
    <div className="hd-root">
      <HelpNav />

      {/* Hero */}
      <div className="hd-hero">
        <div className="hd-hero-inner">
          <p className="hd-hero-eyebrow">Roomify Help Centre</p>
          <h1>How can we help you?</h1>
          <div className={`hd-search-bar ${query ? "hd-search-active" : ""}`}>
            <span className="hd-search-icon">{Icons.Search}</span>
            <input
              type="text"
              placeholder="Search — e.g. 'request booking', 'generate receipt', 'payment'"
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveCategory("all"); }}
              autoFocus
            />
            {query && (
              <button className="hd-search-clear" onClick={() => setQuery("")}>
                {Icons.X}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hd-container">

        {/* Categories */}
        {!query && (
          <div className="hd-cats">
            {CATEGORIES.map(cat => {
              const c = COLOR[cat.color];
              const isActive = activeCategory === cat.id;
              const count = cat.id === "all" ? ARTICLES.length : ARTICLES.filter(a => a.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  className={`hd-cat-card ${isActive ? "hd-cat-active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}>
                  <div className={`hd-cat-icon ${isActive ? "hd-cat-icon-active" : c.icon}`}>
                    {Icons[cat.icon]}
                  </div>
                  <div className="hd-cat-label">{cat.label}</div>
                  <div className="hd-cat-count">{count} articles</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Section heading */}
        <div className="hd-section-head">
          <h2>
            {query
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`
              : activeCategory === "all"
                ? "All Help Articles"
                : CATEGORIES.find(c => c.id === activeCategory)?.label}
          </h2>
          {(query || activeCategory !== "all") && (
            <button className="hd-clear-filter" onClick={() => { setQuery(""); setActiveCategory("all"); }}>
              Clear filter
            </button>
          )}
        </div>

        {/* Articles grid */}
        {filtered.length > 0 ? (
          <div className="hd-articles-grid">
            {filtered.map(article => (
              <ArticleCard key={article.id} article={article} onClick={() => setOpenArticle(article)} />
            ))}
          </div>
        ) : (
          <div className="hd-empty">
            <div className="hd-empty-icon">{Icons.Search}</div>
            <h3>No articles found</h3>
            <p>Try different keywords or browse a category above.</p>
            <button className="hd-empty-btn" onClick={() => { setQuery(""); setActiveCategory("all"); }}>
              Browse all articles
            </button>
          </div>
        )}

        {/* Contact strip */}
        <div className="hd-contact-strip">
          <div className="hd-contact-left">
            <h3>Still need help?</h3>
            <p>Our support team is available Mon–Sat, 9 AM – 8 PM IST.</p>
          </div>
          <div className="hd-contact-btns">
            <a href="mailto:support@roomify.in" className="hd-contact-btn hd-contact-secondary">
              {Icons.Mail} Email us
            </a>
            <button className="hd-contact-btn hd-contact-primary">
              {Icons.Chat} Live Chat
            </button>
          </div>
        </div>

      </div>
      <HelpFooter />
    </div>
  );
}

function HelpNav() {
  return (
    <nav className="hd-nav">
      <div className="hd-nav-inner">
        <span className="hd-logo">Roomify <span className="hd-logo-tag">Help</span></span>


        {/* LOGO SECTION */}
        <Link to="/" className="hd-logo-container">
          <img src={logo} alt="Roomify Logo" className="hd-project-logo" />
         
        </Link>
{/* <span className="hd-logo-text">Help Centre</span> */}
        <div className="hd-nav-links">
    <Link to="/">Home</Link>
    {/* <Link to="/">Find PG</Link>
    <Link to="/owner-dashboard">List PG</Link> */}
  </div>

      </div>
    </nav>
  );
}

function HelpFooter() {
  return (
    <footer className="hd-footer">
      <span>© 2025 Roomify. Built for India's PG market 🇮🇳</span>
      <span>support@roomify.in</span>
    </footer>
  );
}
