const Request = require('../models/request');
const PG = require('../models/pg');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ================= SEND REQUEST =================
exports.sendRequest = async (req, res) => {
  try {
    const { pgId, userId, ownerId, formData } = req.body;

    if (!pgId || !userId || !ownerId) {
      return res.status(400).json({ message: "Missing PG, user, or owner ID" });
    }

    // Check if request already exists and is not rejected/deleted
    const existing = await Request.findOne({ 
      pgId, 
      userId, 
      status: { $in: ['pending', 'approved'] },
      clientDeleted: false 
    });
    if (existing) return res.status(400).json({ message: "You already have an active request for this PG" });

    const newRequest = new Request({
      pgId,
      userId,
      ownerId,
      formData: { ...formData, moveInDate: new Date(formData.moveInDate) },
    });

    await newRequest.save();
    res.status(201).json({ message: "Request sent successfully!" });
  } catch (err) {
    console.error("SEND REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= GET SINGLE REQUEST =================
exports.getSingleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id)
      .populate("pgId", "name price images address")
      .populate("userId", "name email")
      .populate("ownerId", "name email phone"); // Fix: include owner email
    
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    res.json(request);
  } catch (err) {
    console.error("GET SINGLE REQUEST ERROR:", err);
    res.status(500).json({ message: "Error fetching request", error: err.message });
  }
};

// ================= GET CLIENT REQUESTS =================
exports.getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await Request.find({ userId, clientDeleted: false })
      .populate("pgId", "name price images") // Property info with images
      .populate("ownerId", "name email");   // Owner info
    res.json(requests);
  } catch (err) {
    console.error("GET CLIENT REQUESTS ERROR:", err);
    res.status(500).json({ message: "Error fetching requests", error: err.message });
  }
};

// ================= GET OWNER REQUESTS =================
exports.getOwnerRequests = async (req, res) => {
  try {
    // 💡 Get ID from the decoded token, not the URL
    const ownerId = req.user._id; 

    // Find all PGs belonging to this owner
    const pgs = await PG.find({ owner: ownerId }).select("_id");
    const pgIds = pgs.map(pg => pg._id);

    const requests = await Request.find({ pgId: { $in: pgIds }, ownerDeleted: false })
      .populate("pgId", "name price images")
      .populate("userId", "name email")
      .sort({ createdAt: -1 }); // Newest requests first

    res.json(requests);
  } catch (err) {
    console.error("GET OWNER REQUESTS ERROR:", err);
    res.status(500).json({ message: "Error fetching requests" });
  }
};
// ================= UPDATE REQUEST STATUS (APPROVE/REJECT) =================
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, billBreakdown } = req.body; 

    const request = await Request.findById(id)
      .populate("pgId")
      .populate("ownerId")
      .populate("userId");

    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;

    if (status === "approved" && billBreakdown) {
      // 1. Calculate Total
      const totalAmount = Object.values(billBreakdown).reduce((sum, val) => sum + Number(val), 0);
      
      // 2. Attach Receipt Data
      request.receipt = {
        billBreakdown,
        totalAmount,
        generatedAt: new Date()
      };

      // 3. Trigger PDF Generation (Using your existing helper)
      const pdfUrl = await generatePDFReceipt(request);
      request.receipt.receiptUrl = pdfUrl;
    }

    if (status === "rejected") request.ownerDeleted = true;

    await request.save();
    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= CANCEL CLIENT REQUEST =================
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await Request.findByIdAndDelete(id);
    res.json({ message: "Request cancelled successfully" });
  } catch (err) {
    console.error("CANCEL REQUEST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE CLIENT REQUEST (REJECTED) =================
exports.deleteClientRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.clientDeleted = true;
    await request.save();

    res.json({ message: "Request deleted for client" });
  } catch (err) {
    console.error("DELETE CLIENT REQUEST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GENERATE RECEIPT =================
// exports.generateReceipt = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { billBreakdown } = req.body;

//     const request = await Request.findById(id)
//       .populate("pgId", "name price address")
//       .populate("userId", "name email")
//       .populate("ownerId", "name email");

//     if (!request) return res.status(404).json({ message: "Request not found" });
//     if (request.status !== "approved") return res.status(400).json({ message: "Request must be approved first" });

//     // Calculate total amount
//     const totalAmount = Object.values(billBreakdown).reduce((sum, amount) => sum + amount, 0);

//     // Update request with receipt details
//     request.receipt = {
//       billBreakdown,
//       totalAmount,
//       generatedAt: new Date()
//     };

//     await request.save();

//     // Generate PDF receipt
//     const pdfUrl = await generatePDFReceipt(request);
    
//     // Update request with PDF URL
//     request.receipt.receiptUrl = pdfUrl;
//     await request.save();

//     res.json({ message: "Receipt generated successfully", receipt: request.receipt });
//   } catch (err) {
//     console.error("GENERATE RECEIPT ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.generateReceipt = async (req, res) => {
  try {
    // 1. Check if req.body exists (Multer populates this)
    if (!req.body) return res.status(400).json({ message: "No data received" });

    // 2. Parse the charges (sent as JSON.stringify on frontend)
    const charges = typeof req.body.charges === 'string' 
      ? JSON.parse(req.body.charges) 
      : req.body.charges;

    // 3. Get the signature URL from Cloudinary/Multer
    const signature = req.file ? req.file.path : "";

    // 4. Create the Receipt
    const newReceipt = new Receipt({
      ...req.body,
      charges,
      signature,
      total_amount: Number(req.body.total_amount) // Ensure it's a number
    });

    await newReceipt.save();

    res.status(201).json({ message: "Receipt generated!", receipt: newReceipt });
  } catch (err) {
    console.error("RECEIPT ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};

// ================= DOWNLOAD RECEIPT =================
exports.downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!request.receipt || !request.receipt.receiptUrl) return res.status(404).json({ message: "Receipt not found" });

    const filePath = path.join(__dirname, '..', 'uploads', 'receipts', path.basename(request.receipt.receiptUrl));
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, `receipt_${request._id}.pdf`);
    } else {
      res.status(404).json({ message: "Receipt file not found" });
    }
  } catch (err) {
    console.error("DOWNLOAD RECEIPT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= HELPER FUNCTION: GENERATE PDF RECEIPT =================
async function generatePDFReceipt(request) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Create HTML content for receipt
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #333; }
        .info-section { margin-bottom: 20px; }
        .info-section h3 { color: #555; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .bill-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .bill-table th { background-color: #f5f5f5; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
        .footer { margin-top: 40px; text-align: center; color: #777; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PG ACCOMMODATION RECEIPT</h1>
        <p>Receipt ID: ${request._id}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="info-section">
        <h3>Client Information</h3>
        <div class="info-grid">
          <div><strong>Name:</strong> ${request.formData.fullName}</div>
          <div><strong>Email:</strong> ${request.formData.email}</div>
          <div><strong>Phone:</strong> ${request.formData.phone}</div>
          <div><strong>Occupation:</strong> ${request.formData.occupation}</div>
        </div>
      </div>

      <div class="info-section">
        <h3>Property Information</h3>
        <div class="info-grid">
          <div><strong>PG Name:</strong> ${request.pgId.name}</div>
          <div><strong>Address:</strong> ${request.pgId.address.locality}, ${request.pgId.address.city}</div>
          <div><strong>Move-in Date:</strong> ${new Date(request.formData.moveInDate).toLocaleDateString()}</div>
          <div><strong>Duration:</strong> ${request.formData.stayDuration}</div>
        </div>
      </div>

      <div class="info-section">
        <h3>Bill Breakdown</h3>
        <table class="bill-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rent</td>
              <td>₹${request.receipt.billBreakdown.rent.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Water</td>
              <td>₹${request.receipt.billBreakdown.water.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Electricity</td>
              <td>₹${request.receipt.billBreakdown.electricity.toFixed(2)}</td>
            </tr>
            <tr>
              <td>WiFi</td>
              <td>₹${request.receipt.billBreakdown.wifi.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Cleaning</td>
              <td>₹${request.receipt.billBreakdown.cleaning.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Food</td>
              <td>₹${request.receipt.billBreakdown.food.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total Amount</strong></td>
              <td><strong>₹${request.receipt.totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Thank you for choosing our accommodation!</p>
        <p>For any queries, contact: ${request.ownerId.email}</p>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  
  // Create receipts directory if it doesn't exist
  const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const pdfPath = path.join(receiptsDir, `receipt_${request._id}.pdf`);
  await page.pdf({ path: pdfPath, format: 'A4' });
  
  await browser.close();

  return `/uploads/receipts/receipt_${request._id}.pdf`;
}