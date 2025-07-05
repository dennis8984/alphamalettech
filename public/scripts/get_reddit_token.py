#!/usr/bin/env python3
"""
Reddit OAuth Token Generator for Men's Health Social Media Bot
This script helps you obtain a refresh token for Reddit API access.

Requirements:
    pip install praw

Usage:
    1. Update CLIENT_ID and CLIENT_SECRET with your Reddit app credentials
    2. Run: python get_reddit_token.py
    3. Follow the browser prompts to authorize
    4. Copy the refresh token from the output
"""

import random
import socket
import sys
import webbrowser

try:
    import praw
except ImportError:
    print("Error: praw library not found.")
    print("Please install it with: pip install praw")
    sys.exit(1)

# ===== CONFIGURE YOUR CREDENTIALS HERE =====
CLIENT_ID = "your_client_id_here"
CLIENT_SECRET = "your_client_secret_here"
USER_AGENT = "MensHealthBot/1.0 (by /u/YourUsername)"
# ==========================================

def receive_connection():
    """Wait for and return a connection from the browser"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('localhost', 8080))
    server.listen(1)
    print("Waiting for Reddit to redirect back...")
    client = server.accept()[0]
    server.close()
    return client

def send_message(client, message):
    """Send an HTTP response and close the connection"""
    html = f"""
    <html>
    <head>
        <title>Reddit Authorization</title>
        <style>
            body {{ font-family: system-ui; padding: 40px; max-width: 600px; margin: 0 auto; }}
            .success {{ color: #10b981; }}
            .error {{ color: #ef4444; }}
            code {{ background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }}
        </style>
    </head>
    <body>
        <h1>{message}</h1>
        <p>You can close this window and return to the terminal.</p>
    </body>
    </html>
    """
    client.send(f'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n{html}'.encode('utf-8'))
    client.close()

def get_refresh_token():
    """Guide the user through the OAuth2 flow to get a refresh token"""
    
    # Validate credentials
    if CLIENT_ID == "your_client_id_here" or CLIENT_SECRET == "your_client_secret_here":
        print("\n❌ Error: Please update CLIENT_ID and CLIENT_SECRET in this script!")
        print("   You can find these in your Reddit app settings.")
        return None
    
    print("\n🚀 Reddit OAuth Token Generator")
    print("=" * 50)
    print(f"Client ID: {CLIENT_ID}")
    print(f"User Agent: {USER_AGENT}")
    print("=" * 50)
    
    # Create a Reddit instance with your app credentials
    try:
        reddit = praw.Reddit(
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            redirect_uri='http://localhost:8080',
            user_agent=USER_AGENT
        )
    except Exception as e:
        print(f"\n❌ Error creating Reddit instance: {e}")
        return None
    
    # Generate a random state for security
    state = str(random.randint(0, 65000))
    
    # Create the authorization URL with necessary scopes
    # These scopes allow reading and submitting posts/comments
    scopes = ['identity', 'submit', 'read', 'save', 'edit', 'history']
    auth_url = reddit.auth.url(scopes, state, 'permanent')
    
    print(f"\n📋 Opening your browser to Reddit for authorization...")
    print(f"   If the browser doesn't open, visit this URL:")
    print(f"   {auth_url}\n")
    
    # Open the authorization URL in the user's browser
    webbrowser.open(auth_url)
    
    # Wait for the redirect
    try:
        client = receive_connection()
        data = client.recv(1024).decode('utf-8')
    except Exception as e:
        print(f"\n❌ Error receiving connection: {e}")
        return None
    
    # Extract the code from the response
    try:
        param_tokens = data.split(' ', 2)[1].split('?', 1)[1].split('&')
        params = {key: value for (key, value) in [token.split('=') for token in param_tokens]}
    except Exception as e:
        send_message(client, f'<span class="error">Error parsing response</span>')
        print(f"\n❌ Error parsing response: {e}")
        return None
    
    # Verify state to prevent CSRF attacks
    if state != params.get('state'):
        send_message(client, '<span class="error">State mismatch. Possible CSRF attack.</span>')
        print("\n❌ State mismatch. Possible CSRF attack.")
        return None
    
    # Check for access denied error
    if 'error' in params:
        error_msg = params.get('error', 'Unknown error')
        send_message(client, f'<span class="error">Authorization denied: {error_msg}</span>')
        print(f"\n❌ Authorization denied: {error_msg}")
        return None
    
    # Check if we got the code
    if 'code' not in params:
        send_message(client, '<span class="error">No authorization code received</span>')
        print("\n❌ No authorization code received")
        return None
    
    # Exchange the code for a refresh token
    try:
        print("✅ Authorization code received, exchanging for refresh token...")
        refresh_token = reddit.auth.authorize(params['code'])
        send_message(client, '<span class="success">✅ Success! Check your terminal for the refresh token.</span>')
    except Exception as e:
        send_message(client, f'<span class="error">Failed to get refresh token: {e}</span>')
        print(f"\n❌ Failed to get refresh token: {e}")
        return None
    
    return refresh_token

def main():
    """Main function"""
    token = get_refresh_token()
    
    if token:
        print("\n" + "=" * 50)
        print("✅ SUCCESS! Your refresh token is:")
        print("=" * 50)
        print(f"\n{token}\n")
        print("=" * 50)
        print("⚠️  IMPORTANT:")
        print("   1. Store this token securely - you won't be able to retrieve it again!")
        print("   2. Add this to your Reddit credentials in the Men's Health admin panel")
        print("   3. Do NOT share this token with anyone")
        print("=" * 50)
    else:
        print("\n❌ Failed to obtain refresh token.")
        print("   Please check your credentials and try again.")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Process interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()