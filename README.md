AfyaAlert

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
