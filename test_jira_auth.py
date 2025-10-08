#!/usr/bin/env python3
"""
Test JIRA authentication without CORS restrictions
This will help determine if the issue is CORS or invalid credentials
"""
import requests
import base64
import json
import sys

def test_jira_auth():
    # Your JIRA details
    JIRA_URL = "https://puchawinbori.atlassian.net"
    EMAIL = "puchawinbori@gmail.com"

    print("=" * 70)
    print("🔍 JIRA Authentication Test (No CORS)")
    print("=" * 70)

    # Get API token from user
    print(f"\nJIRA URL: {JIRA_URL}")
    print(f"Email: {EMAIL}")
    api_token = input("\nPaste your JIRA API token: ").strip()

    if not api_token:
        print("❌ No API token provided")
        return

    # Create auth header
    auth_string = f"{EMAIL}:{api_token}"
    auth_bytes = auth_string.encode('ascii')
    base64_bytes = base64.b64encode(auth_bytes)
    base64_string = base64_bytes.decode('ascii')

    headers = {
        'Authorization': f'Basic {base64_string}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    # Test endpoint
    endpoint = f"{JIRA_URL}/rest/api/3/myself"

    print(f"\n🔄 Testing endpoint: {endpoint}")
    print("=" * 70)

    try:
        response = requests.get(endpoint, headers=headers, timeout=10)

        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Reason: {response.reason}")
        print("\n📋 Response Headers:")
        for key, value in response.headers.items():
            if 'cors' in key.lower() or 'access-control' in key.lower():
                print(f"   {key}: {value}")

        print("\n" + "=" * 70)

        if response.status_code == 200:
            data = response.json()
            print("✅ AUTHENTICATION SUCCESSFUL!")
            print("=" * 70)
            print(f"\n👤 Authenticated as: {data.get('displayName', 'N/A')}")
            print(f"📧 Email: {data.get('emailAddress', 'N/A')}")
            print(f"🆔 Account ID: {data.get('accountId', 'N/A')}")

            print("\n" + "=" * 70)
            print("🎯 CONCLUSION: Your credentials are VALID")
            print("=" * 70)
            print("\nThe browser CORS error is NOT due to invalid credentials.")
            print("It's a genuine CORS restriction from JIRA.")
            print("\n✅ This means: You NEED a backend server (Render/Railway)")
            print("❌ Frontend-only approach WON'T work")

        elif response.status_code == 401:
            print("❌ AUTHENTICATION FAILED (401 Unauthorized)")
            print("=" * 70)
            print("\nPossible causes:")
            print("1. Invalid API token")
            print("2. Wrong email address")
            print("3. Token expired")
            print("\nResponse body:")
            print(response.text)

        elif response.status_code == 403:
            print("❌ FORBIDDEN (403)")
            print("=" * 70)
            print("\nYour credentials are valid but you don't have permission")
            print("Response body:")
            print(response.text)

        else:
            print(f"⚠️ UNEXPECTED STATUS: {response.status_code}")
            print("=" * 70)
            print("\nResponse body:")
            print(response.text)

    except requests.exceptions.RequestException as e:
        print(f"\n❌ REQUEST FAILED: {e}")
        print("\nThis is a network error (not CORS, not auth)")

    print("\n" + "=" * 70)

if __name__ == "__main__":
    test_jira_auth()
