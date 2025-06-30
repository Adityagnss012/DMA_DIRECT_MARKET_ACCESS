/*
  # Fix Row Level Security policies for profile creation

  1. Security Updates
    - Drop existing restrictive policies
    - Add proper policies that allow profile creation during signup
    - Ensure users can create and manage their own profiles
    - Allow authenticated users to read basic profile information

  2. Policy Changes
    - Allow INSERT for authenticated users creating their own profile
    - Allow SELECT for users reading their own profile
    - Allow UPDATE for users updating their own profile
    - Allow SELECT for public profile information (for farmers/buyers to see each other)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create new policies that allow proper profile creation
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view other profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);