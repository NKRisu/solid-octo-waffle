CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    train_number TEXT,
    name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    location TEXT,
    subscribe BOOLEAN NOT NULL DEFAULT FALSE,
    contact_method TEXT NOT NULL,
    description TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO feedback (train_number, name, phone_number, email, issue_type, location, subscribe, contact_method, description)
VALUES
    ('1234', 'Test User', '+358401234567', 'test-feedback@example.com', 'other', 'Helsinki', FALSE, 'email', 'Initial feedback entry for test page.');
