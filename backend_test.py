#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class CuoreArtigianoAPITester:
    def __init__(self, base_url="https://galleria-artigiani.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, {}

    def test_health_check(self):
        """Test the root health endpoint"""
        return self.run_test("Health Check", "GET", "", 200)

    def test_get_works_public(self):
        """Test getting works without authentication"""
        return self.run_test("Get Works (Public)", "GET", "works", 200)

    def test_get_works_with_category(self):
        """Test getting works with category filter"""
        return self.run_test("Get Works with Category", "GET", "works?category=Orecchini", 200)

    def test_auth_me_without_token(self):
        """Test auth/me without token (should fail)"""
        return self.run_test("Auth Me (No Token)", "GET", "auth/me", 401)

    def create_test_session(self):
        """Create a test session using MongoDB directly"""
        print("\n🔧 Creating test session...")
        try:
            import subprocess
            import uuid
            
            # Generate test data
            user_id = f"test-user-{int(datetime.now().timestamp())}"
            session_token = f"test_session_{int(datetime.now().timestamp())}"
            email = f"test.user.{int(datetime.now().timestamp())}@example.com"
            
            # MongoDB command to create test user and session
            mongo_cmd = f"""
            use('test_database');
            db.users.insertOne({{
                user_id: '{user_id}',
                email: '{email}',
                name: 'Test Artigiano',
                picture: 'https://via.placeholder.com/150',
                brand_name: 'Test Brand',
                bio: 'Bio di test',
                whatsapp: '393331234567',
                profile_image: '',
                created_at: new Date().toISOString()
            }});
            db.user_sessions.insertOne({{
                user_id: '{user_id}',
                session_token: '{session_token}',
                expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
                created_at: new Date().toISOString()
            }});
            """
            
            result = subprocess.run(
                ['mongosh', '--eval', mongo_cmd],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.session_token = session_token
                self.user_id = user_id
                print(f"✅ Test session created - User ID: {user_id}")
                print(f"   Session Token: {session_token}")
                return True
            else:
                print(f"❌ Failed to create test session: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating test session: {str(e)}")
            return False

    def test_auth_me_with_token(self):
        """Test auth/me with valid token"""
        if not self.session_token:
            return False, {}
        return self.run_test("Auth Me (With Token)", "GET", "auth/me", 200)

    def test_get_profile(self):
        """Test getting user profile"""
        if not self.session_token:
            return False, {}
        return self.run_test("Get My Profile", "GET", "profile/me", 200)

    def test_create_work(self):
        """Test creating a work"""
        if not self.session_token:
            return False, {}
        
        work_data = {
            "title": "Test Opera Artigianale",
            "description": "Una bellissima opera di test",
            "category": "Orecchini",
            "image_path": "test/image.jpg"
        }
        
        return self.run_test("Create Work", "POST", "works", 201, work_data)

    def test_update_profile(self):
        """Test updating user profile"""
        if not self.session_token:
            return False, {}
        
        profile_data = {
            "brand_name": "Updated Test Brand",
            "bio": "Updated bio di test",
            "whatsapp": "393331234567"
        }
        
        return self.run_test("Update Profile", "PUT", "profile/me", 200, profile_data)

    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        if not self.user_id:
            return
            
        print("\n🧹 Cleaning up test data...")
        try:
            import subprocess
            
            mongo_cmd = f"""
            use('test_database');
            db.users.deleteMany({{user_id: '{self.user_id}'}});
            db.user_sessions.deleteMany({{user_id: '{self.user_id}'}});
            db.works.deleteMany({{user_id: '{self.user_id}'}});
            """
            
            result = subprocess.run(
                ['mongosh', '--eval', mongo_cmd],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                print("✅ Test data cleaned up")
            else:
                print(f"⚠️  Cleanup warning: {result.stderr}")
                
        except Exception as e:
            print(f"⚠️  Cleanup error: {str(e)}")

def main():
    print("🚀 Starting Cuore Artigiano API Tests")
    print("=" * 50)
    
    tester = CuoreArtigianoAPITester()
    
    try:
        # Test public endpoints first
        tester.test_health_check()
        tester.test_get_works_public()
        tester.test_get_works_with_category()
        tester.test_auth_me_without_token()
        
        # Create test session for authenticated tests
        if tester.create_test_session():
            # Test authenticated endpoints
            tester.test_auth_me_with_token()
            tester.test_get_profile()
            tester.test_update_profile()
            tester.test_create_work()
        else:
            print("⚠️  Skipping authenticated tests - could not create test session")
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
        
        if tester.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in tester.failed_tests:
                error_msg = failure.get('error', f"Expected {failure.get('expected')}, got {failure.get('actual')}")
                print(f"   - {failure['test']}: {error_msg}")
        
        success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return 0 if tester.tests_passed == tester.tests_run else 1
        
    finally:
        # Always cleanup
        tester.cleanup_test_data()

if __name__ == "__main__":
    sys.exit(main())