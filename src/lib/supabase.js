import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication helpers
export const auth = {
  // Sign up new user
  signUp: async (email, password, options = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    })
    return { data, error }
  },

  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Reset password
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  // Update user metadata
  updateUserMetadata: async (metadata) => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    })
    return { data, error }
  }
}

// Database helpers
export const database = {
  // Generic select function
  select: async (table, columns = '*', filter = {}) => {
    let query = supabase.from(table).select(columns)
    
    if (filter.eq) {
      Object.entries(filter.eq).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    if (filter.order) {
      query = query.order(filter.order.column, { ascending: filter.order.ascending })
    }
    
    if (filter.limit) {
      query = query.limit(filter.limit)
    }
    
    const { data, error } = await query
    return { data, error }
  },

  // Generic insert function
  insert: async (table, data) => {
    const { response, error } = await supabase.from(table).insert(data)
    return { response, error }
  },

  // Generic update function
  update: async (table, data, filter) => {
    let query = supabase.from(table).update(data)
    
    if (filter.eq) {
      Object.entries(filter.eq).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    const { response, error } = await query
    return { response, error }
  },

  // Generic delete function
  delete: async (table, filter) => {
    let query = supabase.from(table).delete()
    
    if (filter.eq) {
      Object.entries(filter.eq).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    const { response, error } = await query
    return { response, error }
  }
}

// Storage helpers
export const storage = {
  // Upload file
  upload: async (bucket, path, file, options = {}) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options)
    return { data, error }
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Delete file
  delete: async (bucket, paths) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths)
    return { data, error }
  }
}

// Realtime subscriptions
export const realtime = {
  // Subscribe to table changes
  subscribe: (table, callback, filter = {}) => {
    let subscription = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...filter 
        }, 
        callback
      )
      .subscribe()
    
    return subscription
  },

  // Unsubscribe from changes
  unsubscribe: (subscription) => {
    supabase.removeChannel(subscription)
  }
}

export default supabase
