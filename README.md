🎓 Future Edge

Future Edge is a student counselling and admission management platform designed to simplify the post-exam admission journey.
It helps students make informed decisions about colleges, branches, and admissions, while enabling counsellors/admins to manage the entire process efficiently.

🚀 What Problem Does Future Edge Solve?

After entrance exams like MHT-CET / JEE, students often struggle with:

Choosing the right college

Choosing the right branch

Understanding CAP rounds & deadlines

Managing documents and forms

Tracking admission progress

Future Edge solves this by providing a single, guided platform for students and counsellors.

✨ Key Features
👨‍🎓 Student Side

Secure login using registration number

Personalized student dashboard

Admission progress tracking (multi-stage process)

Document upload (PNG/JPEG, optional documents allowed)

Download filled forms uploaded by admin

View notices and updates published by admin

Mobile-friendly interface

🧑‍💼 Admin Side

Secure admin authentication

Create and manage student accounts

View all registered students

Update student admission progress

Upload forms for specific students

View & download student-uploaded documents

Publish / remove news and notices

Centralized admin dashboard

🧠 Platform Flow (High Level)

Public landing page opens first

Student/Admin logs in

Students access their dashboard

Admin manages students, documents, forms & notices

Admission progress is tracked step-by-step

🛠️ Tech Stack
Frontend

React

Vite

TypeScript

Tailwind CSS

Backend / Services

Supabase

Authentication

Database

Row Level Security (RLS)

Storage

Deployment

Vercel

🔐 Security Highlights

Role-based access (Student / Admin)

Supabase Row Level Security (RLS)

No direct client-side database access

Secure document storage

Environment variables for secrets

.env excluded from Git repository

📂 Project Setup (Local Development)
1️⃣ Clone the repository
git clone https://github.com/<your-username>/future-edge.git
cd future-edge
2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables

Create a .env file in the project root:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

⚠️ Never commit .env to GitHub.

4️⃣ Run the project
npm run dev

App will run at:

http://localhost:5173
🌍 Deployment

The project is deployed using Vercel.

Steps:

Push code to GitHub

Import repo into Vercel

Add environment variables in Vercel dashboard

Deploy

📸 Screens & UI

Public Landing Page (Explore Colleges & Branches)

Student Dashboard

Admin Dashboard

Document Upload & Download

Admission Progress Tracker

(Screenshots can be added here later)

📈 Future Enhancements

Rank-based college suggestions

College & branch comparison tools

Counselling appointment booking

Email / WhatsApp notifications

Analytics dashboard for admins

Multi-exam support (NEET, others)

👤 Author

Future Edge
Student Counselling & Admission Guidance Platform

📄 License

This project is currently under active development.
License can be added later if required.
