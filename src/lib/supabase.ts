// On empêche l'usage de ce point d'entrée pour éviter le mélange client/server
throw new Error(
  'N’utilise pas "@/lib/supabase". Utilise "@/lib/supabase-browser" (client) OU "@/lib/supabase-server" (server).'
);