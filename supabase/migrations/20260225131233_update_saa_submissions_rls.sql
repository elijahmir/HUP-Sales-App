-- Drop the old select policy
DROP POLICY IF EXISTS "Users can select their own SAA submissions" ON saa_submissions;

-- Create the new select policy to allow anyone authenticated to view completed submissions,
-- OR their own draft/completed submissions.
CREATE POLICY "Users can select completed SAA submissions or their own" 
ON saa_submissions FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  status = 'completed'
);
