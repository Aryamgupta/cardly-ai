"use server";

import { createClient } from "@/utils/supabase/server";

export interface NotificationItem {
  id: string;
  cardId: string;
  title: string;
  message: string;
  date: string;
  isOverdue: boolean;
}

export async function getPendingFollowUpNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // OPTIMIZED: Run profile check and follow-up query in PARALLEL
  // instead of sequentially — saves one DB round-trip on every notification poll
  const [profileResult, followUpsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('in_app_notifications')
      .eq('id', user.id)
      .single(),
    supabase
      .from('cards')
      .select('id, full_name, company_name, follow_up_date')
      .eq('user_id', user.id)
      .eq('follow_up_status', 'pending')
      .not('follow_up_date', 'is', null)
      .order('follow_up_date', { ascending: true })
      .limit(5),
  ]);

  // If user has explicitly disabled in-app notifications, return empty
  if (profileResult.data && profileResult.data.in_app_notifications === false) {
    return [];
  }

  const followUps = followUpsResult.data;
  if (!followUps) return [];

  return followUps.map((card) => {
    const dueDate = new Date(card.follow_up_date);
    const isOverdue = dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
    
    return {
      id: `notif-${card.id}`,
      cardId: card.id,
      title: isOverdue ? 'Overdue Follow-up' : 'Upcoming Follow-up',
      message: `You need to follow up with ${card.full_name}${card.company_name ? ` at ${card.company_name}` : ''}.`,
      date: card.follow_up_date,
      isOverdue
    };
  });
}
