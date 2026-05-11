-- ====================================================================
-- TukangKawal — Supabase Database Setup Script
-- ====================================================================
-- Jalankan script ini di Supabase Dashboard → SQL Editor → New Query
-- Jalankan SEMUA sekaligus (copy-paste seluruhnya)
-- ====================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. TABEL PROFILES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  initials TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'non-member'
    CHECK (role IN ('non-member', 'member', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS untuk profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa lihat profil (untuk tampil di artikel, dll)
CREATE POLICY "Profil bisa dilihat semua orang"
  ON public.profiles FOR SELECT
  USING (true);

-- User hanya bisa update profil sendiri
CREATE POLICY "User bisa update profil sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- User bisa insert profil sendiri (saat register via trigger)
CREATE POLICY "User bisa insert profil sendiri"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User bisa delete profil sendiri
CREATE POLICY "User bisa delete profil sendiri"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);


-- ════════════════════════════════════════════════════════════════════
-- 2. TABEL CATEGORIES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  badge_class TEXT
);

-- RLS untuk categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Semua orang bisa lihat kategori
CREATE POLICY "Kategori bisa dilihat semua orang"
  ON public.categories FOR SELECT
  USING (true);

-- Hanya admin yang bisa kelola kategori
CREATE POLICY "Admin bisa kelola kategori"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Seed data kategori
INSERT INTO public.categories (slug, label, icon, badge_class) VALUES
  ('business', 'Business', '💼', 'bg-badge-business'),
  ('entertainment', 'Entertainment', '🎬', 'bg-badge-entertainment'),
  ('health', 'Health', '🏥', 'bg-badge-health'),
  ('science', 'Science', '🔬', 'bg-badge-science'),
  ('sports', 'Sports', '⚽', 'bg-badge-sports'),
  ('technology', 'Technology', '💻', 'bg-badge-technology'),
  ('eksklusif', 'Eksklusif', '🔒', 'bg-badge-eksklusif')
ON CONFLICT (slug) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- 3. TABEL ARTICLES
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  category_id INTEGER REFERENCES public.categories(id),
  author_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published')),
  is_exclusive BOOLEAN DEFAULT false,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS untuk articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa baca artikel published non-exclusive
CREATE POLICY "Baca artikel published publik"
  ON public.articles FOR SELECT
  USING (
    status = 'published' AND is_exclusive = false
  );

-- Member & admin bisa baca artikel exclusive
CREATE POLICY "Member baca artikel exclusive"
  ON public.articles FOR SELECT
  USING (
    status = 'published' AND is_exclusive = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('member', 'admin')
    )
  );

-- Author bisa baca draft/review sendiri
CREATE POLICY "Author baca draft sendiri"
  ON public.articles FOR SELECT
  USING (
    auth.uid() = author_id
    AND status IN ('draft', 'review')
  );

-- Admin bisa baca semua artikel
CREATE POLICY "Admin baca semua artikel"
  ON public.articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Member & Admin bisa buat artikel
CREATE POLICY "Member dan admin bisa buat artikel"
  ON public.articles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('member', 'admin')
    )
  );

-- Author bisa edit artikel sendiri
CREATE POLICY "Author bisa edit artikel sendiri"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Admin bisa edit semua artikel
CREATE POLICY "Admin bisa edit semua artikel"
  ON public.articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin bisa hapus artikel
CREATE POLICY "Admin bisa hapus artikel"
  ON public.articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- ════════════════════════════════════════════════════════════════════
-- 4. TABEL SUBSCRIPTIONS
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('1bulan', '1tahun')),
  payment_method TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS untuk subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- User bisa lihat langganan sendiri
CREATE POLICY "User bisa lihat langganan sendiri"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin bisa lihat semua langganan
CREATE POLICY "Admin bisa lihat semua langganan"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- User bisa buat langganan sendiri
CREATE POLICY "User bisa buat langganan sendiri"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin bisa update langganan
CREATE POLICY "Admin bisa update langganan"
  ON public.subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


-- ════════════════════════════════════════════════════════════════════
-- 5. TRIGGER: Auto-create profile saat user register
-- ════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, initials, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 2)),
    'non-member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger jika sudah ada (agar bisa di-run ulang)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ════════════════════════════════════════════════════════════════════
-- 6. STORAGE BUCKETS (jalankan terpisah jika error)
-- ════════════════════════════════════════════════════════════════════
-- Buat bucket untuk cover artikel
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-covers', 'article-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Buat bucket untuk avatar user
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies untuk article-covers
CREATE POLICY "Public bisa lihat cover artikel"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-covers');

CREATE POLICY "Authenticated bisa upload cover"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'article-covers'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Pemilik bisa hapus cover"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'article-covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies untuk avatars
CREATE POLICY "Public bisa lihat avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "User bisa upload avatar sendiri"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "User bisa update avatar sendiri"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "User bisa hapus avatar sendiri"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ════════════════════════════════════════════════════════════════════
-- SELESAI! ✅
-- ════════════════════════════════════════════════════════════════════
-- Langkah selanjutnya:
-- 1. Buat akun admin: Register via app, lalu update role di SQL Editor:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@gmail.com';
-- 2. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env
-- 3. Jalankan npm run dev dan test register/login
