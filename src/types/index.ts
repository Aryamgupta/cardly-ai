
export interface Address {
  text?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export interface AIMetadata {
  has_whatsapp?: boolean;
  tags?: string[];
  summary?: string;
  qr_url?: string;
  [key: string]: JSONValue | undefined;
}

export interface SocialLinks {
  links?: string[];
}

export interface Card {
  id: string;
  processing_status: string
  user_id: string;
  full_name: string;
  company_name?: string;
  designation?: string;
  emails?: string[];
  phones?: string[];
  website?: string;
  address?: Address;
  social_links?: SocialLinks;
  notes?: string;
  original_image_path?: string;
  follow_up_date?: string;
  follow_up_status?: 'pending' | 'completed' | 'cancelled';
  reminder_sent?: boolean;
  ai_metadata?: AIMetadata;
  created_at?: string;
  updated_at?: string;
  back_image_path?: string;
}





export interface FolloUpType {
  id: string;
  full_name: string;
  designation: string;
  company_name: string;
  follow_up_date: string;
}
