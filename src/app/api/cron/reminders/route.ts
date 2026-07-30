import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { toAppError } from '@/utils/errors';

// Initialize a standard supabase client bypassing RLS, because this is a background cron job
// We use the service role key to have access to all users data
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function GET(request: Request) {
  try {
    // Basic authorization to prevent random people from hitting the cron endpoint
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch pending follow-ups that are due today or overdue, and haven't had a reminder sent
    const today = new Date().toISOString();

    const { data: followUps, error } = await supabaseAdmin
      .from('cards')
      .select('id, full_name, company_name, user_id, follow_up_date')
      .eq('follow_up_status', 'pending')
      .eq('reminder_sent', false)
      .lte('follow_up_date', today); // Due today or earlier

    if (error) {
      console.error('Error fetching follow-ups:', error);
      throw error;
    }

    if (!followUps || followUps.length === 0) {
      return NextResponse.json({ message: 'No reminders to send today.' });
    }

    // Group by user_id
    const groupedByUser = followUps.reduce((acc, card) => {
      if (!acc[card.user_id]) acc[card.user_id] = [];
      acc[card.user_id].push(card);
      return acc;
    }, {} as Record<string, typeof followUps>);

    // OPTIMIZED: Bulk-fetch all profiles in ONE query instead of N queries in the loop
    const userIds = Object.keys(groupedByUser);
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email_notifications')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    let emailsSent = 0;

    // Fetch user emails and send reminders
    for (const [userId, cards] of Object.entries(groupedByUser)) {
      // In Supabase, user emails are typically in auth.users, but we can't easily join it via RPC without a custom function.
      // So we use supabaseAdmin.auth.admin.getUserById
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (userError || !user?.email) {
        console.error(`Could not fetch user ${userId}`, userError);
        continue;
      }

      // Check email notifications setting via bulk-fetched profileMap (no extra DB call)
      const profile = profileMap.get(userId);
      if (profile && profile.email_notifications === false) {
        continue; // Skip this user
      }

      // Format the email content
      const userName = user.user_metadata?.full_name || 'User';

      const cardsListHtml = cards.map(c => `
        <div class="card-item">
          <h3>${c.full_name}</h3>
          ${c.company_name ? `<p class="company">from ${c.company_name}</p>` : ''}
          <p class="due">
            Due: ${new Date(c.follow_up_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      `).join('');

      try {
        await resend.emails.send({
          from: `Cardly AI <reminders@${process.env.EMAIL_DOMAIN || 'yourdomain.com'}>`,
          to: user.email,
          subject: `🔔 You have ${cards.length} follow-up${cards.length > 1 ? 's' : ''} due today!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
                .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
                .header { background-color: #0B1020; padding: 32px 40px; text-align: center; }
                .header img { width: 48px; height: 48px; margin-bottom: 12px; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
                .content { padding: 40px; }
                .content p { font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; color: #334155; }
                .button-container { text-align: center; margin: 32px 0; }
                .button { background-color: #5551FF; color: #ffffff !important; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; }
                .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
                .footer p { font-size: 14px; color: #64748b; margin: 0; }
                .card-item { padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; background-color: #f8fafc; text-align: left; }
                .card-item h3 { margin: 0 0 4px 0; color: #0f172a; font-size: 16px; font-weight: 600; }
                .card-item p.company { margin: 0 0 8px 0; color: #475569; font-size: 14px; }
                .card-item p.due { margin: 0; color: #ef4444; font-size: 13px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHJ4PSIyMjAiIGZpbGw9IiMwQjEwMjAiLz4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iaWNvbl9ncmFkIiB4MT0iMjAwIiB5MT0iMjAwIiB4Mj0iODI0IiB5Mj0iODI0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM2MzY2RjEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjOEI1Q0Y2Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGZpbHRlciBpZD0iZ2xvdyIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIiByZXN1bHQ9ImJsdXIiLz4KICAgICAgPGZlQ29tcG9zaXRlIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImJsdXIiIG9wZXJhdG9yPSJvdmVyIi8+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CiAgPHJlY3QgeD0iMjEyIiB5PSIzMTIiIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiByeD0iNDAiIGZpbGw9InVybCgjaWNvbl9ncmFkKSIgZmlsbC1vcGFjaXR5PSIwLjEiIHN0cm9rZT0idXJsKCNpY29uX2dyYWQpIiBzdHJva2Utd2lkdGg9IjQwIi8+CiAgPHBhdGggZD0iTTUxMiAzNjJMNTQyIDQ4Mkw2NjIgNTEyTDU0MiA1NDJMNTEy NjYyTDQ4MiA1NDJMMzYyIDUxMkw0ODIgNDgyTDUxMiAzNjJaIiBmaWxsPSJ1cmwoI2ljb25fZ3JhZCkiIGZpbHRlcj0idXJsKCNnbG93KSIvPgogIDxjaXJjbGUgY3g9IjUxMiIgY3k9IjUxMiIgcj0iNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLW9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4=" alt="Cardly Logo">
                  <h1>Cardly AI</h1>
                </div>
                
                <div class="content">
                  <p>Hi ${userName},</p>
                  <p>You have <strong>${cards.length} contact${cards.length > 1 ? 's' : ''}</strong> that require your attention today. Don't let these connections slip away!</p>
                  
                  <div style="margin-bottom: 32px;">
                    ${cardsListHtml}
                  </div>
                  
                  <div class="button-container">
                    <a href="https://${process.env.NEXT_PUBLIC_SITE_URL || 'yourdomain.com'}/dashboard" class="button">Open Dashboard</a>
                  </div>
                </div>
                
                <div class="footer">
                  <p>&copy; 2026 Cardly AI. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        // Mark as sent
        const cardIds = cards.map(c => c.id);
        await supabaseAdmin
          .from('cards')
          .update({ reminder_sent: true })
          .in('id', cardIds);

        emailsSent++;
      } catch (emailErr) {
        const appErr = toAppError(emailErr);
        console.error('Error sending email via Resend:', appErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      processedUsers: Object.keys(groupedByUser).length,
      emailsSent
    });
  } catch (error: unknown) {
    const appErr = toAppError(error);
    console.error('Cron Error:', appErr.message);
    return NextResponse.json({ error: appErr.message }, { status: appErr.statusCode || 500 });
  }
}
