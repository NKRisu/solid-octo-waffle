import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";

const fieldSchemas = {
  trainNumber: z.string().min(1, "Train number is required"),
  name: z.string().min(2, "Name is required"),
  phoneNumber: z.string().optional(),
  email: z.email("Invalid email address"),
  issueType: z.enum(["delay", "cleanliness", "comfort", "safety", "other"]),
  location: z.string().optional(),
  subscribe: z.boolean(),
  contactMethod: z.enum(["email", "phone"]),
  description: z.string().optional(),
};

const formSchema = z.object(fieldSchemas);

const initialFormData = {
  trainNumber: "",
  name: "",
  phoneNumber: "",
  email: "",
  issueType: "delay",
  location: "",
  subscribe: false,
  contactMethod: "email",
  description: "",
};

export default function FeedbackFormPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    const schema = fieldSchemas[name];
    if (!schema || typeof schema.safeParse !== "function") return null;

    try {
      const result = schema.safeParse(value);
      return result.success ? null : result.error.errors[0]?.message || "Invalid field";
    } catch (err) {
      console.error("Field validation failed", name, err);
      return "Invalid field";
    }
  };

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((current) => ({
      ...current,
      [name]: newValue,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, newValue),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Validating form...");
    setError("");
    setResponse(null);

    try {
      formSchema.parse(formData);
      setStatus("Sending feedback...");

      const res = await fetch("https://httpbin.org/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
      setStatus("Feedback submitted successfully.");
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors = {};
        validationError.errors.forEach((e) => {
          errors[e.path[0]] = e.message;
        });
        setFieldErrors(errors);
        setError("Please correct the highlighted fields.");
        setStatus("");
      } else {
        setError(`Unable to submit feedback: ${validationError.message}`);
        setStatus("");
      }
    }
  };

  return (
    <div className="form-page">
      <header className="form-header">
        <h2>Train Feedback Form</h2>
        <p>Report issues or provide feedback about trains in Finland. Data is sent to a test service for demonstration.</p>
      </header>

      <div className="form-grid">
        <section className="form-card">
          <form onSubmit={handleSubmit}>
            <div className={`form-group ${fieldErrors.trainNumber === null ? 'valid' : fieldErrors.trainNumber ? 'error' : ''}`}>
              <label htmlFor="trainNumber">Train Number</label>
              <input
                id="trainNumber"
                name="trainNumber"
                type="text"
                value={formData.trainNumber}
                onChange={handleChange}
                placeholder="e.g., 1234"
                required
              />
            </div>

            <div className={`form-group ${fieldErrors.name === null ? 'valid' : fieldErrors.name ? 'error' : ''}`}>
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className={`form-group ${fieldErrors.phoneNumber === null ? 'valid' : fieldErrors.phoneNumber ? 'error' : ''}`}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            <div className={`form-group ${fieldErrors.email === null ? 'valid' : fieldErrors.email ? 'error' : ''}`}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="issueType">Issue Type</label>
              <select id="issueType" name="issueType" value={formData.issueType} onChange={handleChange}>
                <option value="delay">Delay</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="comfort">Comfort</option>
                <option value="safety">Safety</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={`form-group ${fieldErrors.location === null ? 'valid' : fieldErrors.location ? 'error' : ''}`}>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Helsinki Station"
              />
            </div>

            <div className="form-options">
              <label className="option-inline">
                <input
                  type="checkbox"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleChange}
                />
                Subscribe to train updates
              </label>

              <div className="radio-group">
                <span>Preferred contact</span>
                <label className="option-inline">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={formData.contactMethod === "email"}
                    onChange={handleChange}
                  />
                  Email
                </label>
                <label className="option-inline">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="phone"
                    checked={formData.contactMethod === "phone"}
                    onChange={handleChange}
                  />
                  Phone
                </label>
              </div>
            </div>

            <div className={`form-group ${fieldErrors.description === null ? 'valid' : fieldErrors.description ? 'error' : ''}`}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue or feedback..."
              />
            </div>

            <button className="primary-button" type="submit">
              Submit Feedback
            </button>

            {status && <p className="status-message">{status}</p>}
            {error && <p className="error">{error}</p>}
          </form>
        </section>

        <section className="response-card">
          <div className="response-card-header">
            <h3>Submission Response</h3>
            <p>The test service returns the JSON payload you submitted.</p>
          </div>

          {response ? (
            <div className="response-body">
              <div className="response-summary">
                <div>
                  <strong>Endpoint:</strong>
                  <span>{response.url}</span>
                </div>
                <div>
                  <strong>Request method:</strong>
                  <span>{response.method}</span>
                </div>
              </div>
              <div className="response-json">
                <pre>{JSON.stringify(response.json, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <p className="empty-state">Submit the form to preview the response from the test service.</p>
          )}
        </section>
      </div>

      <div className="page-footer">
        <Link to="/">← Back to train map</Link>
      </div>
    </div>
  );
}
