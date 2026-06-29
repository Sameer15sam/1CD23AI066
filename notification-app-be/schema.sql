CREATE TABLE students (
    id          SERIAL PRIMARY KEY,
    student_id  VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    department  VARCHAR(80) NOT NULL,
    year        SMALLINT NOT NULL CHECK (year BETWEEN 1 AND 5),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_types (
    id       SERIAL PRIMARY KEY,
    slug     VARCHAR(30) UNIQUE NOT NULL,
    label    VARCHAR(60) NOT NULL,
    priority SMALLINT NOT NULL DEFAULT 3
);

INSERT INTO notification_types (slug, label, priority) VALUES
    ('placement', 'Placement Opportunity', 1),
    ('result',    'Examination Result',    2),
    ('event',     'College Event',         3),
    ('circular',  'Circular',              4),
    ('fee',       'Fee Reminder',          4),
    ('general',   'General Announcement',  5);

CREATE TABLE notifications (
    id         SERIAL PRIMARY KEY,
    type_id    INT NOT NULL REFERENCES notification_types(id) ON DELETE RESTRICT,
    title      VARCHAR(200) NOT NULL,
    body       TEXT NOT NULL,
    is_global  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE notification_status (
    id              SERIAL PRIMARY KEY,
    student_id      INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notification_id INT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    UNIQUE (student_id, notification_id)
);

CREATE INDEX idx_status_student     ON notification_status(student_id);
CREATE INDEX idx_status_unread      ON notification_status(student_id, is_read)
    WHERE is_read = FALSE AND is_deleted = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type_id);
CREATE INDEX idx_notifications_date ON notifications(created_at DESC);
CREATE INDEX idx_status_composite   ON notification_status(student_id, notification_id, is_read);
CREATE INDEX idx_status_active      ON notification_status(student_id, is_deleted)
    WHERE is_deleted = FALSE;

INSERT INTO students (student_id, name, email, department, year) VALUES
    ('STU2024001', 'Ayesha Khan',  'ayesha@college.edu', 'Computer Science', 3),
    ('STU2024002', 'Rohan Mehta',  'rohan@college.edu',  'Electronics',      2),
    ('STU2024003', 'Priya Sharma', 'priya@college.edu',  'Mechanical',       4);

INSERT INTO notifications (type_id, title, body, is_global) VALUES
    (1, 'Google Campus Drive 2024',    'Google will be visiting campus on July 10. Register before July 5.', TRUE),
    (2, 'Semester 4 Results Declared', 'Results for Semester 4 are now available on the student portal.',    TRUE),
    (3, 'Annual Tech Fest - Inventia', 'Register for Inventia 2024. Hackathon, robotics, and more.',         TRUE),
    (4, 'Library Timing Update',       'Library will remain open until 9 PM starting Monday.',               TRUE),
    (5, 'Last Date for Fee Payment',   'Pay your semester fees before June 30 to avoid a late fine.',        TRUE),
    (1, 'Amazon Internship Drive',     'Amazon is hiring SDE interns. Apply via the placement portal.',      TRUE);

INSERT INTO notification_status (student_id, notification_id, is_read) VALUES
    (1,1,FALSE),(1,2,TRUE),(1,3,FALSE),(1,4,FALSE),(1,5,FALSE),(1,6,FALSE),
    (2,1,FALSE),(2,2,FALSE),(2,3,TRUE),(2,4,FALSE),(2,5,TRUE),(2,6,FALSE),
    (3,1,TRUE),(3,2,FALSE),(3,3,FALSE),(3,4,TRUE),(3,5,FALSE),(3,6,TRUE);
