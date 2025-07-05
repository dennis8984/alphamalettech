# Web-Based Social Media Setup

The social media marketing system now includes a user-friendly web interface for configuring credentials.

## Accessing the Setup Wizard

1. Navigate to: https://www.menshb.com/admin/social-marketing
2. Click on the "Setup & Configuration" tab
3. You'll see the Social Media Setup Wizard

## Using the Setup Wizard

### Platform Selection
- Click on any platform icon to configure it
- Green checkmark = Active and configured
- Yellow alert = Configured but inactive
- Gray = Not configured

### Setup Tab
1. Enter your credentials for the selected platform
2. Required fields are marked with a red asterisk (*)
3. Click the eye icon to show/hide sensitive fields
4. Click "Save Credentials" to store them securely
5. Use "Clear" to reset the form

### Guide Tab
- Contains step-by-step instructions for each platform
- Quick links to developer portals
- Platform-specific setup requirements
- For Reddit: Includes a pre-filled Python script to get refresh tokens

### Test Tab
- Test all configured platforms with one click
- See validation results in real-time
- Check rate limits for each platform
- Preview how posts will appear

## Security Notes

- All credentials are encrypted and stored securely
- API endpoints require admin authentication
- Never share your credentials or commit them to git
- Rotate tokens regularly for security

## Troubleshooting

If credentials fail to validate:
1. Check for extra spaces in your credentials
2. Ensure all required permissions are granted
3. Verify your app is in "Live" mode (Facebook/Instagram)
4. Check that your tokens haven't expired

## Next Steps

After configuring credentials:
1. Test each platform using the Test tab
2. Return to the Dashboard tab
3. Click "Start Automation" to begin automated posting
4. Monitor the queue and engagement metrics