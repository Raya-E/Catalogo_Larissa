const SUPABASE_URL = "https://gwmitwjrvdfpyyajiojn.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_WDKX5kI1Wd5VsaWJuuwlJA_WipF-YTn";

if (!window.supabase) {
  throw new Error("A biblioteca do Supabase não foi carregada.");
}

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);