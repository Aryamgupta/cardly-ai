# Cardly AI 📇

Cardly AI is a modern, mobile-first Progressive Web Application (PWA) that uses cutting-edge AI vision to instantly digitize physical business cards.

## Features ✨

- **Smart AI Extraction**: Upload or snap a photo of a business card, and Cardly uses Google's Gemini Vision AI to instantly extract names, job titles, companies, emails, and phone numbers.
- **AI-Powered Semantic Search & Chat (v2.0/v2.1)**: Powered by `pgvector` and Gemini embeddings, allowing users to search their rolodex using natural language (e.g., "Software engineers I met at CES"). Features chat-like contextual insights to summarize network relationships.
- **Biometric & Passkey Authentication**: Secure, passwordless logins leveraging WebAuthn for fingerprint and face recognition, alongside standard SSR Auth and magic links.
- **Geospatial Intelligence**: Cardly automatically infers latitude and longitude coordinates from the extracted address to provide an interactive, zoomed-in Google Map of the contact's location.
- **Event Categorization**: Automatically or manually tag scanned cards by the specific networking event where they were acquired, making it easy to remember where you met someone.
- **Dashboard Insights**: Beautiful at-a-glance analytics and metrics summarizing your networking growth, recent scans, and AI-driven trends.
- **Export to CSV**: Seamlessly export your entire digital directory into a standard CSV format for easy integration with your favorite CRM.
- **Dynamic Classification Tags**: Automatically generates industry-specific keywords (e.g., "Enterprise AI", "Fintech") with consistent, hashed pastel colors.
- **WhatsApp Detection**: AI vision detects if a phone number is linked to WhatsApp based on icons on the physical card, rendering a dynamic green WhatsApp chat button if found.
- **Save to Phone Contacts**: Generates a standard `.vcf` vCard on the fly, allowing users to save the contact directly to their native iOS/Android address book with a single tap.
- **Help & Support System**: Built-in support ticketing via an integrated, dynamically validated contact form.
- **Invite Hub / Referral System**: A dedicated "Invite Friends" hub using a mobile-first approach. Features native Web Share API integration (for messaging apps) and beautifully pre-formatted `mailto:` email fallbacks.
- **Custom Toaster Notifications**: A fully bespoke, custom-themed global toast notification system (powered by `sonner`) for providing rich, animated feedback across server actions and client forms.
- **Responsive & Dynamic UI**: Beautiful glassmorphism UI optimized for all devices, featuring ambient background glow, sticky scroll views, and dynamic client-side active-state navigation routing.
- **Type-Safe Forms**: End-to-end form validation using `react-hook-form` and `zod` for robust client-side error handling on auth, support, and contact edit pages.
- **Advanced PWA Installation**: Global React Context managing the native `beforeinstallprompt` event, powering a smart global installation modal (with 4-hour snooze) and seamless inline install buttons across Auth and Settings pages.
- **Automated Data Cleanup**: Database-level CRON jobs (`pg_cron`) paired with a Postgres queue system to automatically clean up orphaned cards and empty scans, pushing real-time completion events directly to the user's notification feed.
- **Interactive UI Elements**: In-line editable contact notes that sync securely with the server in real-time, and password visibility toggles across all authentication forms.

## Supabase Email Templates 📧

We have included pre-designed, branded HTML email templates for all major Supabase Auth operations. You can find them in the `supabase/email-templates` directory:

1. `confirm-signup.html` - Triggered when a new user signs up.
2. `reset-password.html` - Triggered when a user requests a password reset link.
3. `magic-link.html` - Triggered for passwordless sign-in (OTP).
4. `change-email.html` - Triggered when a user updates their email address.

To use them, simply copy the HTML from these files and paste them into your Supabase Dashboard under **Authentication -> Email Templates**. They automatically use an embedded Base64 version of the Cardly logo so it bypasses external image blockers!

## Tech Stack 🛠️

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL, `pgvector`, `pg_cron`, Auth & Storage)
- **AI / Vision**: [Google Gemini AI](https://ai.google.dev/) (Vision & Embeddings)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **PWA Integration**: [Serwist](https://serwist.build/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

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
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # App Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # Google Gemini AI Configuration
   GEMINI_API_KEY=your_gemini_api_key
   
   # Optional: Email Configuration (for Help & Support)
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=587
   SMTP_USER=resend
   SMTP_PASS=your_resend_api_key
   SMTP_FROM_EMAIL=support@yourdomain.com
   SUPPORT_EMAIL=your_personal_email@domain.com
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
