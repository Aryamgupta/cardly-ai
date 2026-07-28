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
  [key: string]: JSONValue | undefined;
}

export interface SocialLinks {
  links?: string[];
}

export interface Card {
  id: string;
  processing_status:string
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
  ai_metadata?: AIMetadata;
  created_at?: string;
  updated_at?: string;
}
