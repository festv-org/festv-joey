# Email & Phone Verification Deployment Script
# Run these commands line by line

# 1. Install backend dependencies (Resend + Twilio)
cd D:\Workplace\Claudespace\caterease\backend
npm install resend twilio

# 2. Go back to root
cd ..

# 3. Git add all changes
git add .

# 4. Commit
git commit -m "Add email and phone verification system with Resend and Twilio"

# 5. Push to deploy
git push

# ============================================
# AFTER DEPLOYMENT:
# ============================================
# 
# 6. Add environment variables to Render Backend:
#
# Go to: Render Dashboard → Backend Service → Environment
#
# Add these variables:
# 
# RESEND_API_KEY=re_xxxxx          (Get from https://resend.com/api-keys)
# TWILIO_ACCOUNT_SID=ACxxxxx       (Get from https://console.twilio.com)
# TWILIO_AUTH_TOKEN=xxxxx          (Get from https://console.twilio.com)
# TWILIO_PHONE_NUMBER=+1xxxxxxxxxx (Get from Twilio console)
#
# 7. Click "Save Changes" - this will restart the service
#
# ============================================
# HOW TO GET API KEYS:
# ============================================
#
# RESEND (Email):
# 1. Go to https://resend.com
# 2. Sign up (free 3,000 emails/month)
# 3. Go to API Keys → Create API Key
# 4. Copy the key (starts with "re_")
#
# TWILIO (SMS):
# 1. Go to https://www.twilio.com/try-twilio
# 2. Sign up (free trial includes $15 credit)
# 3. Verify your email and phone
# 4. Go to Console → Account → Account SID (copy this)
# 5. Click "Auth Token" → Show (copy this)
# 6. Go to Phone Numbers → Buy a Number (or use trial number)
# 7. Copy your Twilio phone number (must include +1)
#
# ============================================
# TESTING:
# ============================================
#
# After adding env vars and deployment completes:
# 1. Go to https://fetes-frontend.onrender.com/account/verify
# 2. Click "Send Verification Code" for email
# 3. Check your email inbox
# 4. Enter the 6-digit code
# 5. Click "Verify"
#
# For SMS (optional for now):
# 1. Add phone number in your profile first
# 2. Click "Send SMS Code"
# 3. Enter code from SMS
# 4. Click "Verify"
#
