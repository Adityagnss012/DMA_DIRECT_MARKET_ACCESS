/*
  # Complete fix for profiles table RLS policies

  1. Security Updates
    - Drop all existing policies completely
    - Create new policies that properly allow profile creation and management
    - Ensure proper authentication flow works

  2. Policy Changes
    - Allow INSERT for authenticated users with proper user ID matching
    - Allow SELECT for users reading their own profile and others for marketplace functionality
    - Allow UPDATE for users updating their own profile
    - Fix the auth.uid() function usage
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view other profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Disable RLS temporarily to ensure clean state
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper auth.uid() usage
CREATE POLICY "Enable insert for authenticated users creating own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users to read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users to update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users to view other profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);