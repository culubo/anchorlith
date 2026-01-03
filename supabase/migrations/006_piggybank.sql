-- 006_piggybank.sql

-- Create piggybanks table: one per user
CREATE TABLE IF NOT EXISTS piggybanks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL UNIQUE,
  target numeric(12,2) NOT NULL DEFAULT 0,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS piggybank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piggybank_id uuid REFERENCES piggybanks(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and add policies
ALTER TABLE IF EXISTS piggybanks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS piggybanks_owner_policy ON piggybanks;
CREATE POLICY piggybanks_owner_policy
  ON piggybanks
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE IF EXISTS piggybank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS piggybank_transactions_owner_policy ON piggybank_transactions;
CREATE POLICY piggybank_transactions_owner_policy
  ON piggybank_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM piggybanks
      WHERE piggybanks.id = piggybank_transactions.piggybank_id
        AND piggybanks.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS piggybank_transactions_insert_policy ON piggybank_transactions;
CREATE POLICY piggybank_transactions_insert_policy
  ON piggybank_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM piggybanks
      WHERE piggybanks.id = piggybank_transactions.piggybank_id
        AND piggybanks.user_id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON piggybanks;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON piggybanks
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
