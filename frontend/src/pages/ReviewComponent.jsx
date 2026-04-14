import React, { useState } from 'react';
import axios from 'axios';
import { Star, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReviewComponent = ({ pgId, reviews, refreshData }) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PROJECT SYNC: Using 'user' and 'token' to match your dashboard
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Please login to post a review');
    if (rating === 0) return toast.error('Please select a rating');

    setIsSubmitting(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
      };

      // Ensure endpoint matches your router (plural 'reviews' vs singular 'review')
      await axios.post(`http://localhost:3000/api/pg/${pgId}/reviews`, { rating, message }, config);
      
      setMessage('');
      setRating(0);
      refreshData(); 
      toast.success('Review Posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="luxe-reviews-section">
      <h3 className="content-heading">User Reviews ({reviews?.length || 0})</h3>
      
      <div className="reviews-grid">
        {reviews && reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev._id} className="modern-rev-card">
              <div className="rev-user-row">
                <strong>{rev.user?.name || "Guest User"}</strong>
                <div className="star-display" style={{color: '#FFD700'}}>
                    {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                </div>
              </div>
              <p className="description-text">{rev.message}</p>
            </div>
          ))
        ) : (
          <p className="empty-msg">No reviews yet.</p>
        )}
      </div>

      <div className="review-form-card">
        <h4>Write a Review</h4>
        {user ? (
          <form onSubmit={submitHandler}>
            <div className="rating-input-wrapper">
              <select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                className="luxe-select"
                style={{width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '10px'}}
              >
                <option value="0">Select Stars...</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How was your experience?"
              className="luxe-textarea"
            ></textarea>
            <button type="submit" className="luxe-post-btn" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <p className="login-prompt">Please login to write a review.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewComponent;