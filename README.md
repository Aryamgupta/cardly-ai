# Cardly AI 📇

Cardly AI is a modern, mobile-first Progressive Web Application (PWA) that uses cutting-edge AI vision to instantly digitize physical business cards.

## Features ✨

- **Smart AI Extraction**: Upload or snap a photo of a business card, and Cardly uses Google's Gemini Vision AI to instantly extract names, job titles, companies, emails, and phone numbers.
- **Geospatial Intelligence**: Cardly automatically infers latitude and longitude coordinates from the extracted address to provide an interactive, zoomed-in Google Map of the contact's location.
- **Dynamic Classification Tags**: Automatically generates industry-specific keywords (e.g., "Enterprise AI", "Fintech") with consistent, hashed pastel colors.
- **WhatsApp Detection**: AI vision detects if a phone number is linked to WhatsApp based on icons on the physical card, rendering a dynamic green WhatsApp chat button if found.
- **Save to Phone Contacts**: Generates a standard `.vcf` vCard on the fly, allowing users to save the contact directly to their native iOS/Android address book with a single tap.
- **Native App Intents**: Launch phone calls, open email clients, and send SMS messages using native OS links (`tel:`, `mailto:`, `sms:`).
- **Pure JS Perspective Warping**: Fast, serverless-friendly image processing using a custom mathematical perspective transformation engine to handle rotated/skewed card photos.

## Tech Stack 🛠️

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Storage)
- **AI / Vision**: [Google Gemini AI](https://ai.google.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started 🚀

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/cardly.git
   cd cardly
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema 🗄️

Cardly relies on a simple, robust PostgreSQL schema to track scanned cards and their AI metadata. Ensure your Supabase instance has the following structure:
- `cards` (id, user_id, full_name, company_name, designation, emails, phones, social_links, address, notes, original_image_path, ai_metadata)

## License 📄

This project is licensed under the MIT License.
