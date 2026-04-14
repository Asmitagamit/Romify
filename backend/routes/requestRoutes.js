

// routes/requestRoutes.js
// const express = require('express');
// const router = express.Router();
// const requestController = require('../controllers/requestcontroller');

// const { protect, ownerOnly } = require('../middleware/authMiddleware');

// // 1. SPECIFIC ROUTES FIRST
// router.post('/send', requestController.sendRequest);
// router.get('/user/:userId', requestController.getUserRequests);

// // ✅ FIXED: Changed getRequestsByOwner to getOwnerRequests
// // router.get('/owner/:ownerId', requestController.getOwnerRequests); 
// router.get('/owner-requests', protect, requestController.getOwnerRequests);

// // 2. DYNAMIC ID ROUTES LAST
// router.get('/:id', requestController.getSingleRequest);

// // 3. OTHER ACTIONS
// router.put('/:id/status', requestController.updateRequestStatus);
// router.post('/:id/generate-receipt', requestController.generateReceipt);
// router.get('/:id/download-receipt', requestController.downloadReceipt);
// router.delete('/:id', requestController.cancelRequest);
// router.put('/:id/delete-client', requestController.deleteClientRequest);

// module.exports = router;

const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestcontroller');

// 🛡️ Import the guards from your auth middleware
const { protect, ownerOnly } = require('../Middleware/auth.js');

// ==========================================================================
// 1. CLIENT / USER ROUTES
// ==========================================================================

// Send a new inquiry (Must be logged in)
router.post('/send', protect, requestController.sendRequest);

// Get all requests for a specific user (Used in Client Dashboard)
router.get('/user/:userId', protect, requestController.getUserRequests);

// Cancel a pending request
router.delete('/:id', protect, requestController.cancelRequest);

// Hide a rejected request from the client view
router.put('/:id/delete-client', protect, requestController.deleteClientRequest);


// ==========================================================================
// 2. OWNER ROUTES (Requires 'protect' AND 'ownerOnly')
// ==========================================================================

// Get all inquiries for the logged-in owner's properties
// 💡 URL no longer needs :ownerId because we get it from the Token!
router.get('/owner-requests', protect, ownerOnly, requestController.getOwnerRequests);

// Approve or Reject a request (and generate receipt data)
// 💡 Changed to PATCH as it's a partial update
router.patch('/:id/status', protect, ownerOnly, requestController.updateRequestStatus);

// Generate the PDF receipt for an approved request
router.post('/:id/generate-receipt', protect, ownerOnly, requestController.generateReceipt);


// ==========================================================================
// 3. GENERAL / SHARED ROUTES
// ==========================================================================

// Get details for one specific request
router.get('/:id', protect, requestController.getSingleRequest);

// Download the actual PDF file
router.get('/:id/download-receipt', protect, requestController.downloadReceipt);

module.exports = router;

