-- Function to renew subscription for the currently logged-in user
CREATE OR REPLACE FUNCTION public.renew_subscription(duration_days INT DEFAULT 30)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_profiles
  SET 
    access_expiry = (
      CASE 
        -- If currently valid, add to the end of current expiry
        WHEN access_expiry > NOW() THEN access_expiry + (duration_days || ' days')::INTERVAL
        -- If expired, reset to start from NOW
        ELSE NOW() + (duration_days || ' days')::INTERVAL
      END
    ),
    is_active = TRUE
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant functionality to authenticated users (so they can trigger their own renewal)
GRANT EXECUTE ON FUNCTION public.renew_subscription TO authenticated;
