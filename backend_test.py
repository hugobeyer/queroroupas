#!/usr/bin/env python3
"""
Backend API Testing for Quero Roupas Product Management System
Tests all CRUD operations for the product management API
"""

import requests
import json
import sys
from datetime import datetime
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get backend URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"🔗 Testing API at: {API_URL}")

# Test data for ladies clothing store
test_products = [
    {
        "name": "Vestido Floral Elegante",
        "price": 129.90,
        "image": "https://example.com/vestido-floral.jpg",
        "category": "Vestidos",
        "isNew": True
    },
    {
        "name": "Blusa de Seda Premium",
        "price": 89.90,
        "image": "https://example.com/blusa-seda.jpg", 
        "category": "Blusas",
        "isNew": False
    },
    {
        "name": "Calça Jeans Skinny",
        "price": 159.90,
        "image": "https://example.com/calca-jeans.jpg",
        "category": "Calças",
        "isNew": True
    },
    {
        "name": "Saia Midi Plissada",
        "price": 99.90,
        "image": "https://example.com/saia-midi.jpg",
        "category": "Saias",
        "isNew": False
    }
]

created_product_ids = []
test_results = {
    "total_tests": 0,
    "passed": 0,
    "failed": 0,
    "errors": []
}

def log_test(test_name, success, message=""):
    test_results["total_tests"] += 1
    if success:
        test_results["passed"] += 1
        print(f"✅ {test_name}")
    else:
        test_results["failed"] += 1
        test_results["errors"].append(f"{test_name}: {message}")
        print(f"❌ {test_name}: {message}")

def test_api_health():
    """Test if API is accessible"""
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        if response.status_code == 200:
            log_test("API Health Check", True)
            return True
        else:
            log_test("API Health Check", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        log_test("API Health Check", False, f"Connection error: {str(e)}")
        return False

def test_get_products_empty():
    """Test getting products when database is empty or has existing products"""
    try:
        response = requests.get(f"{API_URL}/products", timeout=10)
        if response.status_code == 200:
            products = response.json()
            log_test("GET /products (initial)", True, f"Found {len(products)} existing products")
            return True
        else:
            log_test("GET /products (initial)", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("GET /products (initial)", False, f"Error: {str(e)}")
        return False

def test_create_products():
    """Test creating multiple products"""
    global created_product_ids
    
    for i, product_data in enumerate(test_products):
        try:
            response = requests.post(
                f"{API_URL}/products",
                json=product_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                product = response.json()
                if all(key in product for key in ["id", "name", "price", "category", "isNew", "createdAt"]):
                    created_product_ids.append(product["id"])
                    log_test(f"POST /products - Create {product_data['name']}", True)
                else:
                    log_test(f"POST /products - Create {product_data['name']}", False, "Missing required fields in response")
            else:
                log_test(f"POST /products - Create {product_data['name']}", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            log_test(f"POST /products - Create {product_data['name']}", False, f"Error: {str(e)}")

def test_get_all_products():
    """Test getting all products after creation"""
    try:
        response = requests.get(f"{API_URL}/products", timeout=10)
        if response.status_code == 200:
            products = response.json()
            if len(products) >= len(created_product_ids):
                log_test("GET /products (after creation)", True, f"Retrieved {len(products)} products")
                
                # Verify our created products are in the list
                created_names = [p["name"] for p in test_products]
                retrieved_names = [p["name"] for p in products]
                
                found_products = 0
                for name in created_names:
                    if name in retrieved_names:
                        found_products += 1
                
                if found_products == len(created_names):
                    log_test("Verify created products in list", True)
                else:
                    log_test("Verify created products in list", False, f"Only found {found_products}/{len(created_names)} products")
                    
                return products
            else:
                log_test("GET /products (after creation)", False, f"Expected at least {len(created_product_ids)} products, got {len(products)}")
        else:
            log_test("GET /products (after creation)", False, f"Status code: {response.status_code}")
    except Exception as e:
        log_test("GET /products (after creation)", False, f"Error: {str(e)}")
    
    return []

def test_update_products():
    """Test updating products"""
    if not created_product_ids:
        log_test("UPDATE products", False, "No products to update")
        return
    
    # Test updating the first product
    product_id = created_product_ids[0]
    update_data = {
        "name": "Vestido Floral Elegante - ATUALIZADO",
        "price": 149.90,
        "isNew": False
    }
    
    try:
        response = requests.put(
            f"{API_URL}/products/{product_id}",
            json=update_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            updated_product = response.json()
            if (updated_product["name"] == update_data["name"] and 
                updated_product["price"] == update_data["price"] and
                updated_product["isNew"] == update_data["isNew"]):
                log_test("PUT /products/{id} - Update product", True)
            else:
                log_test("PUT /products/{id} - Update product", False, "Updated data doesn't match")
        else:
            log_test("PUT /products/{id} - Update product", False, f"Status: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        log_test("PUT /products/{id} - Update product", False, f"Error: {str(e)}")

def test_toggle_new_status():
    """Test toggling isNew status"""
    if len(created_product_ids) < 2:
        log_test("Toggle isNew status", False, "Need at least 2 products")
        return
    
    product_id = created_product_ids[1]
    
    try:
        # Toggle to True
        response = requests.put(
            f"{API_URL}/products/{product_id}",
            json={"isNew": True},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            product = response.json()
            if product["isNew"] == True:
                log_test("Toggle isNew to True", True)
            else:
                log_test("Toggle isNew to True", False, f"Expected True, got {product['isNew']}")
        else:
            log_test("Toggle isNew to True", False, f"Status: {response.status_code}")
            
        # Toggle back to False
        response = requests.put(
            f"{API_URL}/products/{product_id}",
            json={"isNew": False},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            product = response.json()
            if product["isNew"] == False:
                log_test("Toggle isNew to False", True)
            else:
                log_test("Toggle isNew to False", False, f"Expected False, got {product['isNew']}")
        else:
            log_test("Toggle isNew to False", False, f"Status: {response.status_code}")
            
    except Exception as e:
        log_test("Toggle isNew status", False, f"Error: {str(e)}")

def test_delete_products():
    """Test deleting products"""
    if not created_product_ids:
        log_test("DELETE products", False, "No products to delete")
        return
    
    # Delete the last product
    product_id = created_product_ids[-1]
    
    try:
        response = requests.delete(f"{API_URL}/products/{product_id}", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if "message" in result and "deleted" in result["message"].lower():
                log_test("DELETE /products/{id}", True)
                
                # Verify product is actually deleted
                get_response = requests.get(f"{API_URL}/products", timeout=10)
                if get_response.status_code == 200:
                    products = get_response.json()
                    deleted_product_exists = any(p["id"] == product_id for p in products)
                    if not deleted_product_exists:
                        log_test("Verify product deletion", True)
                    else:
                        log_test("Verify product deletion", False, "Product still exists after deletion")
            else:
                log_test("DELETE /products/{id}", False, f"Unexpected response: {result}")
        else:
            log_test("DELETE /products/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
            
    except Exception as e:
        log_test("DELETE /products/{id}", False, f"Error: {str(e)}")

def test_error_scenarios():
    """Test error handling scenarios"""
    
    # Test updating non-existent product
    try:
        response = requests.put(
            f"{API_URL}/products/non-existent-id",
            json={"name": "Test"},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 404:
            log_test("Update non-existent product (404 error)", True)
        else:
            log_test("Update non-existent product (404 error)", False, f"Expected 404, got {response.status_code}")
            
    except Exception as e:
        log_test("Update non-existent product (404 error)", False, f"Error: {str(e)}")
    
    # Test deleting non-existent product
    try:
        response = requests.delete(f"{API_URL}/products/non-existent-id", timeout=10)
        
        if response.status_code == 404:
            log_test("Delete non-existent product (404 error)", True)
        else:
            log_test("Delete non-existent product (404 error)", False, f"Expected 404, got {response.status_code}")
            
    except Exception as e:
        log_test("Delete non-existent product (404 error)", False, f"Error: {str(e)}")

def run_all_tests():
    """Run all backend API tests"""
    print("🧪 Starting Quero Roupas Backend API Tests")
    print("=" * 50)
    
    # Test API connectivity first
    if not test_api_health():
        print("❌ API is not accessible. Stopping tests.")
        return False
    
    # Run all tests in sequence
    test_get_products_empty()
    test_create_products()
    test_get_all_products()
    test_update_products()
    test_toggle_new_status()
    test_delete_products()
    test_error_scenarios()
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {test_results['total_tests']}")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    
    if test_results['errors']:
        print("\n🚨 FAILED TESTS:")
        for error in test_results['errors']:
            print(f"  • {error}")
    
    success_rate = (test_results['passed'] / test_results['total_tests']) * 100 if test_results['total_tests'] > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    if test_results['failed'] == 0:
        print("\n🎉 All tests passed! Backend API is working correctly.")
        return True
    else:
        print(f"\n⚠️  {test_results['failed']} test(s) failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)