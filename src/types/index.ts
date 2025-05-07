export interface Poll {
    id: string
    title: string
    user_id: string
    created_at: string
  }
  
  export interface Option {
    id: string
    poll_id: string
    text: string
  }
  
  export interface Vote {
    id: string
    poll_id: string
    option_id: string
    user_id: string
    created_at: string
  }