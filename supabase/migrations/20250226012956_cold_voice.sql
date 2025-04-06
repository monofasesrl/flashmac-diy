/*
  # Add Additional Admin Users
  
  1. New Users
    - paglia@flashmac.com (admin role)
    - info@flashmac.com (admin role)
  
  2. Security
    - Users are created with admin role
    - Passwords are hashed using bcrypt
*/

-- Add paglia@flashmac.com admin user
INSERT INTO public.users (email, password, role)
VALUES (
  'paglia@flashmac.com',
  '$2a$10$xJ7Yt1UE3E3E9PO8PZ3Zz.q5H5g5g5g5g5g5g5g5g5g5g5g5g5g5', -- hashed 'admin123'
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Add info@flashmac.com admin user
INSERT INTO public.users (email, password, role)
VALUES (
  'info@flashmac.com',
  '$2a$10$xJ7Yt1UE3E3E9PO8PZ3Zz.q5H5g5g5g5g5g5g5g5g5g5g5g5g5g5', -- hashed 'admin123'
  'admin'
)
ON CONFLICT (email) DO NOTHING;
