# Cardly AI 📇

Cardly AI is a modern, mobile-first Progressive Web Application (PWA) that uses cutting-edge AI vision to instantly digitize physical business cards.

## Features ✨

- **Smart AI Extraction**: Upload or snap a photo of a business card, and Cardly uses Google's Gemini Vision AI to instantly extract names, job titles, companies, emails, and phone numbers.
- **Geospatial Intelligence**: Cardly automatically infers latitude and longitude coordinates from the extracted address to provide an interactive, zoomed-in Google Map of the contact's location.
- **Dynamic Classification Tags**: Automatically generates industry-specific keywords (e.g., "Enterprise AI", "Fintech") with consistent, hashed pastel colors.
- **WhatsApp Detection**: AI vision detects if a phone number is linked to WhatsApp based on icons on the physical card, rendering a dynamic green WhatsApp chat button if found.
- **Save to Phone Contacts**: Generates a standard `.vcf` vCard on the fly, allowing users to save the contact directly to their native iOS/Android address book with a single tap.
- **Secure Authentication & Password Management**: Built-in Supabase SSR Auth with secure PKCE callback flows, email verification, and a robust "Change Password" flow requiring current password validation.
- **Invite Hub / Referral System**: A dedicated "Invite Friends" hub using a mobile-first approach. Features native Web Share API integration (for messaging apps) and beautifully pre-formatted `mailto:` email fallbacks.
- **Custom Toaster Notifications**: A fully bespoke, custom-themed global toast notification system (powered by `sonner`) for providing rich, animated feedback across server actions and client forms.
- **Responsive & Dynamic UI**: Beautiful glassmorphism UI optimized for all devices, featuring ambient background glow, sticky scroll views, and dynamic client-side active-state navigation routing.

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
