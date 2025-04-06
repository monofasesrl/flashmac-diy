-- Create admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM users WHERE email = 'admin@example.com'
  ) THEN
    INSERT INTO users (id, email, password, role)
    VALUES (
      gen_random_uuid(),
      'admin@example.com',
      '$2a$10$xJ7Yt1UE3E3E9PO8PZ3Zz.q5H5g5g5g5g5g5g5g5g5g5g5g5g5g5', -- hashed 'admin123'
      'admin'
    );
  END IF;
END
$$;

-- Grant necessary permissions
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Ensure admin user can access everything
CREATE POLICY "Admin has full access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
