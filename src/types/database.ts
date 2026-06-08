export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          grade: string
          favorite_character: string
          favorite_activity: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          grade: string
          favorite_character: string
          favorite_activity: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          grade?: string
          favorite_character?: string
          favorite_activity?: string
          notes?: string | null
          created_at?: string
        }
      }
      storytelling_materials: {
        Row: {
          id: string
          student_id: string
          subject: string
          learning_goal: string
          story_situation: string
          story_length: string
          story_content: string
          worksheet_content: unknown
          coloring_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject: string
          learning_goal: string
          story_situation: string
          story_length: string
          story_content: string
          worksheet_content: unknown
          coloring_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject?: string
          learning_goal?: string
          story_situation?: string
          story_length?: string
          story_content?: string
          worksheet_content?: unknown
          coloring_image_url?: string | null
          created_at?: string
        }
      }
      diary_materials: {
        Row: {
          id: string
          student_id: string
          title: string
          raw_input: string
          final_text: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          raw_input: string
          final_text: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          raw_input?: string
          final_text?: string
          image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
