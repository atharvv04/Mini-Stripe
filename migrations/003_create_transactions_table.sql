-- Migration: 003_create_transactions_table.sql
-- Description: Create transactions table for storing payment transaction records

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_link_id UUID NOT NULL REFERENCES payment_links(id) ON DELETE CASCADE,
    payer_email VARCHAR(255) NOT NULL,
    payer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50) NOT NULL,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(20),
    bank_response_code VARCHAR(10),
    bank_response_message TEXT,
    failure_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_payment_link_id ON transactions(payment_link_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_payer_email ON transactions(payer_email);
CREATE INDEX IF NOT EXISTS idx_transactions_processed_at ON transactions(processed_at);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE transactions IS 'Stores payment transaction records';
COMMENT ON COLUMN transactions.id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN transactions.payment_link_id IS 'Reference to the payment link used for this transaction';
COMMENT ON COLUMN transactions.payer_email IS 'Email address of the person making the payment';
COMMENT ON COLUMN transactions.payer_name IS 'Name of the person making the payment';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount in the specified currency';
COMMENT ON COLUMN transactions.currency IS 'Currency code for the transaction (default: USD)';
COMMENT ON COLUMN transactions.status IS 'Current status of the transaction';
COMMENT ON COLUMN transactions.payment_method IS 'Method used for payment (e.g., card, bank_transfer)';
COMMENT ON COLUMN transactions.card_last4 IS 'Last 4 digits of the card number (masked for security)';
COMMENT ON COLUMN transactions.card_brand IS 'Brand of the card (e.g., Visa, Mastercard)';
COMMENT ON COLUMN transactions.bank_response_code IS 'Response code from the bank/mock bank API';
COMMENT ON COLUMN transactions.bank_response_message IS 'Response message from the bank/mock bank API';
COMMENT ON COLUMN transactions.failure_reason IS 'Reason for failure if transaction failed';
COMMENT ON COLUMN transactions.processed_at IS 'When the transaction was processed by the bank';
COMMENT ON COLUMN transactions.created_at IS 'Timestamp when the transaction was created';
COMMENT ON COLUMN transactions.updated_at IS 'Timestamp when the transaction was last updated'; 