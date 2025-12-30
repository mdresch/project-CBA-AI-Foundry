-- Analytics Tables Migration
-- This migration creates tables for comprehensive analytics tracking

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Behavior Metrics Table
CREATE TABLE IF NOT EXISTS user_behavior_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,
    total_messages INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    average_session_duration INTEGER DEFAULT 0, -- in milliseconds
    average_messages_per_session DECIMAL(10,2) DEFAULT 0,
    most_used_model VARCHAR(100),
    most_used_templates TEXT[],
    average_typing_speed DECIMAL(10,2) DEFAULT 0, -- characters per minute
    scroll_behavior JSONB DEFAULT '{}',
    engagement JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session Analytics Table
CREATE TABLE IF NOT EXISTS session_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration INTEGER, -- in milliseconds
    message_count INTEGER DEFAULT 0,
    user_message_count INTEGER DEFAULT 0,
    ai_message_count INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0, -- in milliseconds
    models_used TEXT[],
    templates_used TEXT[],
    files_uploaded INTEGER DEFAULT 0,
    chain_of_thought_interactions INTEGER DEFAULT 0,
    suggestion_clicks INTEGER DEFAULT 0,
    scroll_events INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    user_journey JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Interaction Metrics Table
CREATE TABLE IF NOT EXISTS chat_interaction_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL,
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content_length INTEGER DEFAULT 0,
    response_time INTEGER, -- in milliseconds
    model VARCHAR(100),
    has_attachments BOOLEAN DEFAULT FALSE,
    attachment_types TEXT[],
    chain_of_thought_steps INTEGER DEFAULT 0,
    suggestion_clicks INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scroll Behavior Metrics Table
CREATE TABLE IF NOT EXISTS scroll_behavior_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_scrolls INTEGER DEFAULT 0,
    scroll_depth INTEGER DEFAULT 0,
    time_spent_scrolling INTEGER DEFAULT 0, -- in milliseconds
    auto_scroll_events INTEGER DEFAULT 0,
    manual_scroll_events INTEGER DEFAULT 0,
    scroll_to_bottom_clicks INTEGER DEFAULT 0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Typing Behavior Metrics Table
CREATE TABLE IF NOT EXISTS typing_behavior_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id UUID NOT NULL,
    typing_duration INTEGER NOT NULL, -- in milliseconds
    typing_speed DECIMAL(10,2) NOT NULL, -- characters per minute
    pause_count INTEGER DEFAULT 0,
    backspace_count INTEGER DEFAULT 0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_behavior_metrics_user_id ON user_behavior_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_metrics_session_id ON user_behavior_metrics(session_id);

CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id ON session_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_user_id ON session_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_session_analytics_start_time ON session_analytics(start_time);

CREATE INDEX IF NOT EXISTS idx_chat_interaction_metrics_message_id ON chat_interaction_metrics(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_interaction_metrics_session_id ON chat_interaction_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_interaction_metrics_user_id ON chat_interaction_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_scroll_behavior_metrics_session_id ON scroll_behavior_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_scroll_behavior_metrics_user_id ON scroll_behavior_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_typing_behavior_metrics_session_id ON typing_behavior_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_typing_behavior_metrics_user_id ON typing_behavior_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_behavior_metrics_message_id ON typing_behavior_metrics(message_id);

-- Create RLS policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_interaction_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scroll_behavior_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_behavior_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_behavior_metrics
CREATE POLICY "Users can view their own behavior metrics" ON user_behavior_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavior metrics" ON user_behavior_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior metrics" ON user_behavior_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for session_analytics
CREATE POLICY "Users can view their own session analytics" ON session_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session analytics" ON session_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_interaction_metrics
CREATE POLICY "Users can view their own chat interaction metrics" ON chat_interaction_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat interaction metrics" ON chat_interaction_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for scroll_behavior_metrics
CREATE POLICY "Users can view their own scroll behavior metrics" ON scroll_behavior_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scroll behavior metrics" ON scroll_behavior_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for typing_behavior_metrics
CREATE POLICY "Users can view their own typing behavior metrics" ON typing_behavior_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own typing behavior metrics" ON typing_behavior_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION update_user_behavior_metrics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_behavior_metrics (
        user_id,
        session_id,
        total_messages,
        total_sessions,
        average_session_duration,
        average_messages_per_session,
        most_used_model,
        most_used_templates,
        average_typing_speed,
        scroll_behavior,
        engagement,
        preferences,
        updated_at
    ) VALUES (
        NEW.user_id,
        NEW.session_id,
        1, -- total_messages
        1, -- total_sessions
        0, -- average_session_duration
        1.0, -- average_messages_per_session
        NEW.data->>'model', -- most_used_model
        ARRAY[]::TEXT[], -- most_used_templates
        0, -- average_typing_speed
        '{}', -- scroll_behavior
        '{}', -- engagement
        '{}', -- preferences
        NOW()
    )
    ON CONFLICT (user_id, session_id) DO UPDATE SET
        total_messages = user_behavior_metrics.total_messages + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics events
CREATE TRIGGER trigger_update_user_behavior_metrics
    AFTER INSERT ON analytics_events
    FOR EACH ROW
    WHEN (NEW.event_type = 'message_sent')
    EXECUTE FUNCTION update_user_behavior_metrics();

-- Create function to clean up old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void AS $$
BEGIN
    -- Delete analytics events older than 90 days
    DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete old scroll behavior metrics
    DELETE FROM scroll_behavior_metrics WHERE timestamp < NOW() - INTERVAL '90 days';
    
    -- Delete old typing behavior metrics
    DELETE FROM typing_behavior_metrics WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old data (if pg_cron is available)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics_data();');
