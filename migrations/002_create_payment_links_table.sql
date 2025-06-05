-- Migration: 002_create_payment_links_table.sql
-- Description: Create payment links table for storing payment link information

CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    link_id VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_link_id ON payment_links(link_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_expires_at ON payment_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_links_is_active ON payment_links(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_at ON payment_links(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_payment_links_updated_at 
    BEFORE UPDATE ON payment_links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure current_uses doesn't exceed max_uses
ALTER TABLE payment_links 
ADD CONSTRAINT check_uses_limit 
CHECK (max_uses IS NULL OR current_uses <= max_uses);

-- Add comments for documentation
COMMENT ON TABLE payment_links IS 'Stores payment link information created by users';
COMMENT ON COLUMN payment_links.id IS 'Unique identifier for the payment link';
COMMENT ON COLUMN payment_links.user_id IS 'Reference to the user who created this payment link';
COMMENT ON COLUMN payment_links.link_id IS 'Unique identifier used in the payment URL';
COMMENT ON COLUMN payment_links.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN payment_links.currency IS 'Currency code for the payment (default: USD)';
COMMENT ON COLUMN payment_links.description IS 'Optional description for the payment';
COMMENT ON COLUMN payment_links.expires_at IS 'When the payment link expires (NULL = never)';
COMMENT ON COLUMN payment_links.is_active IS 'Whether the payment link is active';
COMMENT ON COLUMN payment_links.max_uses IS 'Maximum number of times this link can be used (NULL = unlimited)';
COMMENT ON COLUMN payment_links.current_uses IS 'Current number of times this link has been used';
COMMENT ON COLUMN payment_links.created_at IS 'Timestamp when the payment link was created';
COMMENT ON COLUMN payment_links.updated_at IS 'Timestamp when the payment link was last updated'; 