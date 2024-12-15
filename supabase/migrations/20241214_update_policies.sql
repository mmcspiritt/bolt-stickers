-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own designs" ON designs;
DROP POLICY IF EXISTS "Users can insert their own designs" ON designs;
DROP POLICY IF EXISTS "Users can update their own designs" ON designs;
DROP POLICY IF EXISTS "Users can delete their own designs" ON designs;

-- Create new policies for anonymous access
CREATE POLICY "Allow anonymous design access"
    ON designs FOR SELECT
    USING (true);  -- Allow all reads

CREATE POLICY "Allow anonymous design creation"
    ON designs FOR INSERT
    WITH CHECK (true);  -- Allow all inserts

CREATE POLICY "Allow anonymous design updates"
    ON designs FOR UPDATE
    USING (true);  -- Allow all updates

CREATE POLICY "Allow anonymous design deletion"
    ON designs FOR DELETE
    USING (true);  -- Allow all deletes
