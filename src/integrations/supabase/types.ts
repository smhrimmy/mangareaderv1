export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          favorite_genres: string[] | null
          theme: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          favorite_genres?: string[] | null
          theme?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          favorite_genres?: string[] | null
          theme?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reading_history: {
        Row: {
          id: string
          user_id: string
          manga_id: string
          chapter_id: string
          page_number: number
          total_pages: number
          progress_percentage: number
          completed: boolean
          read_at: string
        }
        Insert: {
          id?: string
          user_id: string
          manga_id: string
          chapter_id: string
          page_number: number
          total_pages: number
          progress_percentage: number
          completed?: boolean
          read_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          manga_id?: string
          chapter_id?: string
          page_number?: number
          total_pages?: number
          progress_percentage?: number
          completed?: boolean
          read_at?: string
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          manga_id: string
          status: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          manga_id: string
          status: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          manga_id?: string
          status?: string
          added_at?: string
        }
      }
      chapter_notifications: {
        Row: {
          id: string
          user_id: string
          manga_id: string
          email_enabled: boolean
          last_notified_chapter: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          manga_id: string
          email_enabled?: boolean
          last_notified_chapter?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          manga_id?: string
          email_enabled?: boolean
          last_notified_chapter?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          manga_id: string
          chapter_id: string | null
          parent_id: string | null
          content: string
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          manga_id: string
          chapter_id?: string | null
          parent_id?: string | null
          content: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          manga_id?: string
          chapter_id?: string | null
          parent_id?: string | null
          content?: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          user_id: string
          comment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comment_id?: string
          created_at?: string
        }
      }
      manga_ratings: {
        Row: {
          id: string
          user_id: string
          manga_id: string
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          manga_id: string
          rating: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          manga_id?: string
          rating?: number
          created_at?: string
        }
      }
      shared_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          manga_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          manga_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          manga_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
