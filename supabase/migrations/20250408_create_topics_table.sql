-- Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    engagement_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some initial topics
INSERT INTO public.topics (id, name, engagement_count) VALUES
    ('climate-change', 'Climate Change', 10),
    ('ai-regulation', 'AI Regulation', 8),
    ('future-of-work', 'Future of Work', 6),
    ('sustainable-energy', 'Sustainable Energy', 5),
    ('digital-privacy', 'Digital Privacy', 4);

-- Set up RLS (Row Level Security)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read topics
CREATE POLICY "Allow public read access to topics" ON public.topics
    FOR SELECT USING (true);
