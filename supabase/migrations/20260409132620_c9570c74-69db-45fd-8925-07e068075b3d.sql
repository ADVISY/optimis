
CREATE TABLE public.otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text NOT NULL,
  code text NOT NULL,
  lead_id text,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 5,
  verified boolean DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone
);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on otp_verifications"
ON public.otp_verifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous can read own OTP by id"
ON public.otp_verifications
FOR SELECT
TO anon
USING (true);

CREATE INDEX idx_otp_phone_code ON public.otp_verifications(phone_e164, code);
CREATE INDEX idx_otp_expires ON public.otp_verifications(expires_at);
