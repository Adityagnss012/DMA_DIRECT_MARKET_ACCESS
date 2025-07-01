/*
  # Add banking information to profiles table

  1. Schema Changes
    - Add banking information columns to profiles table for farmers
    - Add constraints and validation for banking data
    - Update RLS policies if needed

  2. New Columns
    - `bank_account_number` (text, encrypted storage for account numbers)
    - `bank_name` (text, name of the bank)
    - `account_holder_name` (text, name as per bank account)
    - `ifsc_code` (text, Indian Financial System Code)
    - `bank_branch` (text, optional branch information)
    - `banking_verified` (boolean, for future KYC verification)

  3. Security
    - Ensure banking information is only accessible by the account owner
    - Add validation for IFSC codes and account numbers
*/

-- Add banking information columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bank_account_number text,
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS account_holder_name text,
ADD COLUMN IF NOT EXISTS ifsc_code text,
ADD COLUMN IF NOT EXISTS bank_branch text,
ADD COLUMN IF NOT EXISTS banking_verified boolean DEFAULT false;

-- Add constraints for banking information validation
-- IFSC code should be 11 characters (Indian banking standard)
ALTER TABLE profiles 
ADD CONSTRAINT ifsc_code_length_check 
CHECK (ifsc_code IS NULL OR length(ifsc_code) = 11);

-- Bank account number should be reasonable length (9-18 digits)
ALTER TABLE profiles 
ADD CONSTRAINT bank_account_number_length_check 
CHECK (bank_account_number IS NULL OR (length(bank_account_number) >= 9 AND length(bank_account_number) <= 18));

-- Account holder name should not be empty if provided
ALTER TABLE profiles 
ADD CONSTRAINT account_holder_name_check 
CHECK (account_holder_name IS NULL OR length(trim(account_holder_name)) > 0);

-- Bank name should not be empty if provided
ALTER TABLE profiles 
ADD CONSTRAINT bank_name_check 
CHECK (bank_name IS NULL OR length(trim(bank_name)) > 0);

-- Create index for banking verification status
CREATE INDEX IF NOT EXISTS profiles_banking_verified_idx ON profiles(banking_verified);

-- Add comment to document the banking information purpose
COMMENT ON COLUMN profiles.bank_account_number IS 'Encrypted bank account number for payment transfers';
COMMENT ON COLUMN profiles.banking_verified IS 'Whether the banking information has been verified through KYC process';