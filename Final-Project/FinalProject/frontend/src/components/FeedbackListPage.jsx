import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function FeedbackListPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/feedback");
      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    // Date is already formatted by backend as "YYYY-MM-DD HH:MI"
    return dateString || "N/A";
  };

  if (loading) {
    return (
      <div className="form-page">
        <header className="form-header">
          <h2>Feedback List</h2>
          <p>Loading feedbacks...</p>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-page">
        <header className="form-header">
          <h2>Feedback List</h2>
          <p className="error">Error: {error}</p>
        </header>
      </div>
    );
  }

  return (
    <div className="form-page">
      <header className="form-header">
        <h2>Feedback List</h2>
        <p>All submitted feedback reports ({feedbacks.length} total)</p>
      </header>

      <div className="form-grid">
        <section className="form-card">
          {feedbacks.length === 0 ? (
            <p>No feedback submissions yet.</p>
          ) : (
            <div className="feedback-list">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="feedback-item">
                  <div className="feedback-header">
                    <h3>Feedback #{feedback.id}</h3>
                    <span className="feedback-date">
                      {formatDate(feedback.submittedAt)}
                    </span>
                  </div>

                  <div className="feedback-details">
                    <div className="detail-row">
                      <strong>Name:</strong> {feedback.name}
                    </div>
                    <div className="detail-row">
                      <strong>Email:</strong> {feedback.email}
                    </div>
                    {feedback.phoneNumber && (
                      <div className="detail-row">
                        <strong>Phone:</strong> {feedback.phoneNumber}
                      </div>
                    )}
                    {feedback.trainNumber && (
                      <div className="detail-row">
                        <strong>Train Number:</strong> {feedback.trainNumber}
                      </div>
                    )}
                    <div className="detail-row">
                      <strong>Issue Type:</strong> {feedback.issueType}
                    </div>
                    {feedback.location && (
                      <div className="detail-row">
                        <strong>Location:</strong> {feedback.location}
                      </div>
                    )}
                    <div className="detail-row">
                      <strong>Contact Method:</strong> {feedback.contactMethod}
                    </div>
                    <div className="detail-row">
                      <strong>Subscribe:</strong> {feedback.subscribe ? "Yes" : "No"}
                    </div>
                    {feedback.description && (
                      <div className="detail-row">
                        <strong>Description:</strong>
                        <p className="description-text">{feedback.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="response-card">
          <div className="response-card-header">
            <h3>Feedback Statistics</h3>
            <p>Overview of submitted feedback</p>
          </div>

          <div className="response-body">
            <div className="response-summary">
              <div>
                <strong>Total Feedback:</strong>
                <span>{feedbacks.length}</span>
              </div>
              <div>
                <strong>Issue Types:</strong>
                <span>
                  {Object.entries(
                    feedbacks.reduce((acc, fb) => {
                      acc[fb.issueType] = (acc[fb.issueType] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .map(([type, count]) => `${type}: ${count}`)
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="page-footer">
        <Link to="/">← Back to train map</Link>
      </div>
    </div>
  );
}
