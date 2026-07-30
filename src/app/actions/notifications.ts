"use server";

import { createClient } from "@/utils/supabase/server";

export interface NotificationItem {
  id: string;
  cardId: string;
  title: string;
  message: string;
  date: string;
  isOverdue: boolean;
  isSystem?: boolean;
}

export async function getPendingFollowUpNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // OPTIMIZED: Run profile check, follow-up query, and system notifications query in PARALLEL
  const [profileResult, followUpsResult, systemNotifsResult] = await Promise.all([
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
    supabase
      .from('system_notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // If user has explicitly disabled in-app notifications, return empty
  if (profileResult.data && profileResult.data.in_app_notifications === false) {
    return [];
  }

  const followUps = followUpsResult.data || [];
  const systemNotifs = systemNotifsResult.data || [];

  const followUpItems = followUps.map((card) => {
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

  const systemItems = systemNotifs.map((notif) => {
    return {
      id: notif.id,
      cardId: '#', // or something else, but we might want to change link in NotificationMenu
      title: notif.title,
      message: notif.message,
      date: notif.created_at,
      isOverdue: false,
      isSystem: true
    };
  });

  return [...systemItems, ...followUpItems].slice(0, 10);
}
