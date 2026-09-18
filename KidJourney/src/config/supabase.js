import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwtbwabfxtnfkswezghr.supabase.co';
const supabaseAnonKey = 'sb_publishable_dTUVpQaS9moWA-MpS3QhgQ_j_CILgXh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});