-- init.sql
-- This file is used to initialize the database schema for the application.

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  description TEXT,
  categories TEXT[] -- PostgreSQL supports array types!
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    salt VARCHAR(200) NOT NULL,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL
);

INSERT INTO locations (name, lat, lon, description, categories) VALUES
('IST', 28.150248, -81.850817, 
$desc$The Innovation Science and Technology (IST) Building serves as the center of life on campus. It contains:
 • Classrooms
 • Labs
 • Club rooms
 • Faculty offices
 • The Academic Success Center
 • The Library (fully digital)
 • The Mosiac Cafe$desc$, 
ARRAY['Academic', 'Student Services', 'Dining']),

('BARC', 28.149558, -81.851529, 
$desc$The Barnett Applied Research Center (BARC) provides:
 • Research laboratories
 • Teaching laboratories
 • Classrooms
 • Student design spaces
 • Conference rooms
 • Faculty offices
 • Study areas$desc$, 
ARRAY['Academic']),

('Phase I Residence Hall', 28.150920, -81.848913, 
$desc$Residence Hall I$desc$, 
ARRAY['Housing']),

('Phase II Residence Hall', 28.150111, -81.847578, 
$desc$Residence Hall II$desc$, 
ARRAY['Housing']),

('Phase III Residence Hall', 28.149780, -81.848194, 
$desc$Residence Hall III$desc$, 
ARRAY['Housing']),

('The Access Point', 28.149681, -81.847819, 
$desc$The Access Point provides a wide variety of student services including:
 • CARE Services
 • Counseling Services
 • Food Pantry
 • Disability Services & ODS Testing Center
 • Sexual Misconduct and Title IX$desc$, 
ARRAY['Student Services']),

('Wellness Center', 28.149283, -81.847111, 
$desc$The Wellness Center is home to:
 • Auxilliary Enterprises Service Center
 • Dining:
   -The Fuse
   -Einsteins Brother's Bagels
   -Fire + Ash: Concepts Reborn
 • The Nest
 • Student Health Clinic
 • Student Business Services$desc$, 
ARRAY['Student Services', 'Dining']),

('SDC', 28.148020, -81.845619, 
$desc$The Student Development Center (SDC) provides access to:
 • Gym
 • Esports Arena/Arcade
 • Outdoor competition-sized swimming pool
 • Fitness related services$desc$, 
ARRAY['Student Services']),

('University Police Department', 28.150802, -81.846864, 
$desc$The University Police Department is staffed by a team of veteran law enforcement officers who are trained and prepared to respond to campus emergencies and prevent on-campus crime.$desc$,
ARRAY['Campus Safety']),

('Admissions Center', 28.150177, -81.846113, 
$desc$The Admissions Center houses admissions and financial aid staff.$desc$,
ARRAY['Student Services']),

('IFF Global Citrus Innovation Center', 28.146871, -81.850335, 
$desc$Research facility aimed at accelerating innovation by combining the expertise of IFF scientists with Florida Poly's top researchers and STEM-focused students.$desc$,
ARRAY['Student Services']),

('Facilities and Safety Services', 28.150882, -81.846702, 
$desc$Facilities and Safety Services maintains our stunning buildings and surroundings inside and out, supports events on campus, facilitates construction projects, and maintains environmental health and safety.$desc$,
ARRAY['Campus Safety']),

('Campus Store', 28.149416, -81.847985, 
$desc$Buy merchandise and more at the NEW Florida Poly Campus Store!$desc$, 
ARRAY['Student Services']);

