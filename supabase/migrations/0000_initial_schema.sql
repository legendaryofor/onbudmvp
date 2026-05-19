-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    handle TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    buds_balance NUMERIC DEFAULT 10000.00 NOT NULL,
    total_pnl NUMERIC DEFAULT 0.00,
    win_rate NUMERIC DEFAULT 0.00,
    weekly_pnl NUMERIC DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Creators table
CREATE TABLE public.creators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    tier INTEGER CHECK (tier IN (1, 2)) NOT NULL,
    category TEXT CHECK (category IN ('music', 'internet', 'content')) NOT NULL,
    current_price NUMERIC NOT NULL,
    fundamental_anchor NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Price History
CREATE TABLE public.price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    explanation_text TEXT,
    signal_breakdown JSONB
);
CREATE INDEX idx_price_history_creator_timestamp ON public.price_history(creator_id, timestamp DESC);

-- Positions (Holdings)
CREATE TABLE public.positions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
    shares NUMERIC NOT NULL,
    avg_entry_price NUMERIC NOT NULL,
    opened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMPTZ,
    exit_price NUMERIC,
    realized_pnl NUMERIC,
    status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open' NOT NULL
);
CREATE INDEX idx_positions_user ON public.positions(user_id);
CREATE INDEX idx_positions_creator ON public.positions(creator_id);

-- Watchlist
CREATE TABLE public.watchlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    price_at_add NUMERIC NOT NULL,
    UNIQUE(user_id, creator_id)
);

-- Signal Snapshots (Input for AI engine)
CREATE TABLE public.signal_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    news_volume NUMERIC,
    news_sentiment NUMERIC,
    social_mentions NUMERIC,
    social_sentiment NUMERIC,
    streaming_data JSONB,
    trading_flow NUMERIC,
    raw_data JSONB
);
CREATE INDEX idx_signal_snapshots_creator_timestamp ON public.signal_snapshots(creator_id, timestamp DESC);

-- Badges
CREATE TABLE public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_type TEXT CHECK (badge_type IN ('weekly_top_10', 'backer_of_week', 'early_backer')) NOT NULL,
    creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE, -- Nullable if not specific to a creator
    week_of DATE,
    earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Friendships
CREATE TABLE public.friendships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    friend_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, friend_user_id)
);

-- Row Level Security (RLS) Settings
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Base Policies (Public Read for global stats, restricted writes)
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Creators are viewable by everyone." ON public.creators FOR SELECT USING (true);
CREATE POLICY "Price history is viewable by everyone." ON public.price_history FOR SELECT USING (true);

CREATE POLICY "Users can view their own positions." ON public.positions FOR SELECT USING (auth.uid() = user_id);
-- (We will add more complex policies later for public/private portfolio toggles)

CREATE POLICY "Users can view and manage their own watchlist." ON public.watchlist FOR ALL USING (auth.uid() = user_id);
