AI PROMPT FOR THE WEB APP
You are an expert frontend developer.  
Build me a *working website for AfyaAlert*, a Kenyan medicine price and availability tracker.  

### Requirements:
- Use *React + Vite + TailwindCSS* for frontend.
- Clean, modern UI inspired by *health-tech dashboards* (white background, green/blue accents, rounded cards).
- Mobile-first responsive design.

### Pages & Features:
1. *Landing Page*
   - Header: Logo (AfyaAlert) + Nav (Home, Search Medicines, Partner Pharmacies, About, Contact)
   - Hero section: Tagline “Find affordable medicines near you” + search bar
   - Call-to-action buttons: “Search Now” & “Partner with Us”
   - Illustration/healthcare-themed hero image

2. *Medicine Search Page*
   - Search input for medicine name
   - Mock results displayed in a grid of cards:
     - Medicine name, strength, price, pharmacy name, location, availability badge (In-stock/Out of stock)
     - “Reserve” button (click triggers a modal with confirmation)
   - Ability to *filter by location* (dropdown: Nairobi, Mombasa, Kisumu, Eldoret)

3. *Partner Pharmacies Page*
   - Table/list view showing mock pharmacies with:
     - Pharmacy name, license number, county, status (Verified / Pending Verification)
   - Call-to-action button: “Join as a Partner Pharmacy”

4. *About Page*
   - Brief about AfyaAlert’s mission to improve medicine access
   - Sections for: Transparency, Trust, Impact

5. *Contact Page*
   - Simple contact form (Name, Email, Message)
   - Mock submission (console log form values)

6. *Footer*
   - Links: Privacy Policy, Terms of Service, PPB Verification
   - Social icons

### Functionality
- Mock search results from a JSON file (medicine data with price + pharmacies).
- Local state for filtering/searching.
- Modal for “Reserve” button (fake reservation confirmation).
- Smooth animations (Framer Motion).
- Fully responsive.

### Tech Stack
- React (Vite)
- TailwindCSS
- Framer Motion (for smooth animations)
- Lucide React (for icons)

Output:  
- Full codebase with all pages/components wired up.  
- Dummy JSON file for medicine + pharmacy data.  
- Include comments so I can later connect real APIs (Firebase, REST).

BACKEND PROMPT
with the front end done let us create backend: You are an expert backend engineer. Build me a Node.js + Express + MongoDB backend for a project called "AfyaAlert". 

## Requirements:
- Use Express for the REST API
- Use MongoDB with Mongoose for database models
- Implement JWT-based authentication for users
- Structure the project in MVC style (routes, controllers, models)
- Use environment variables (.env) for sensitive data

## Database Models:
1. User
   - name (string)
   - email (string, unique)
   - password (hashed)
   - role (enum: consumer | pharmacy | admin)

2. Pharmacy
   - name (string)
   - location (string)
   - license (string, unique)
   - verified (boolean, default false)
   - contact (string)

3. Medicine
   - name (string)
   - strength (string)
   - price (number)
   - availability (boolean)
   - pharmacyId (ObjectId ref to Pharmacy)
   - updatedAt (date)

4. Reservation
   - userId (ObjectId ref to User)
   - medicineId (ObjectId ref to Medicine)
   - pharmacyId (ObjectId ref to Pharmacy)
   - status (enum: pending | confirmed | cancelled)
   - createdAt (date)

## API Endpoints:
### Auth
- POST /api/register → Register user
- POST /api/login → Login user (return JWT)

### Users
- GET /api/users/me → Get logged-in user profile

### Pharmacies
- POST /api/pharmacies/register → Register a pharmacy
- GET /api/pharmacies → List pharmacies
- PUT /api/pharmacies/:id/verify → Admin-only: verify a pharmacy

### Medicines
- POST /api/medicines → Add medicine (pharmacy role only)
- GET /api/medicines → List/search medicines (filters: name, location)
- PUT /api/medicines/:id → Update medicine info

### Reservations
- POST /api/reservations → Reserve a medicine
- GET /api/reservations/:userId → Get user reservations

## Security & Validation:
- Hash passwords using bcrypt
- Protect routes with JWT middleware
- Role-based access control (consumer, pharmacy, admin)
- Validate request bodies using express-validator

## Setup:
- Include instructions in README for:
  1. npm install
  2. create .env file with MONGO_URI and JWT_SECRET
  3. npm run dev (use nodemon)


   PITCH DECK LINK-https://www.canva.com/design/DAGxwIzFha4/AlsyIAYkJ0YZw9XUUmj0JA/edit?utm_content=DAGxwIzFha4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
- 

..........................AFYAALERT.............

AfyaAlert is a Kenyan medicine price and availability tracker that helps users easily find essential medicines across pharmacies, compare prices, and get real-time availability updates.

Built with React + Vite + TailwindCSS, AfyaAlert provides a clean, modern, and responsive health-tech dashboard experience.

🚀 Features
1. Landing Page

Header with logo and navigation

Hero section highlighting AfyaAlert’s mission

Call-to-action buttons (Search Medicines, View Dashboard, Sign Up)

Features section explaining key benefits

Testimonials or trusted partners section

Footer with contact & social links

2. Medicine Search & Availability

Search bar to look up medicines by name

Results showing price, availability, and pharmacy location

Filters (by price, location, pharmacy, availability)

Responsive cards displaying medicine info

3. Dashboard

Personalized dashboard for logged-in users

Saved medicine alerts (price drop or restock notifications)

Graphs showing price trends (Recharts integration)

Profile & settings management

4. Mobile-First UI

Optimized for mobile users first

Responsive layouts scaling to tablet & desktop

Clean design with white backgrounds, green/blue accents, rounded cards

🛠️ Tech Stack

Frontend Framework: React
 + Vite

Styling: TailwindCSS

UI Components: shadcn/ui
, lucide-react

Charts: Recharts

📦 Installation

Clone the repository and install dependencies:

git clone https://github.com/Nakhaima254/afya-finder-aid.git
cd afyaalert
npm install


Run the development server:

npm run dev


Build for production:

npm run build


Preview production build:

npm run preview

📁 Project Structure
afyaalert/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Landing, Dashboard, Search, etc.
│   ├── assets/      # Images, icons
│   ├── App.jsx      # Root component
│   ├── main.jsx     # Entry point
│   └── styles/      # Tailwind + global styles
└── package.json

🎨 Design Guidelines

Colors:

Primary: Green (#16A34A)

Secondary: Blue (#2563EB)

Background: White (#FFFFFF)

Style: Clean, modern, minimal with rounded corners (rounded-2xl), soft shadows, and grid layouts.

📌 Roadmap

 Integrate live pharmacy API (medicine availability)

 Add user authentication (login, signup)

 Enable alerts via SMS/Email/WhatsApp

 Multi-language support (English, Swahili)

 Admin dashboard for pharmacy owners

🤝 Contributing

Contributions are welcome! Please fork this repo and submit a pull request.

📜 License

This project is licensed under the MIT License.


Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
