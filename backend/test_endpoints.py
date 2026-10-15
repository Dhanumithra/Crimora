import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

endpoints = [
    ("GET", "/health"),
    ("GET", "/api/v1/overview/status"),
    ("GET", "/api/v1/overview/executive"),
    ("POST", "/api/v1/solvability/predict", {
        "model": "ensemble",
        "victim_age": 28,
        "victim_sex": "Male",
        "victim_race": "Black",
        "victim_count": 0,
        "weapon": "Handgun - pistol, revolver, etc",
        "circumstance": "Robbery",
        "relationship": "Acquaintance",
        "city": "Los Angeles",
        "state": "California",
        "year": 2022,
        "month": 7,
        "is_weekend": 1,
        "day_of_week": 4
    }),
    ("POST", "/api/v1/clustering/assign", {
        "victim_age": 26,
        "weapon": "Handgun - pistol, revolver, etc"
    }),
    ("GET", "/api/v1/clustering/cold-cases?limit=5"),
    ("GET", "/api/v1/clustering/distributions"),
    ("GET", "/api/v1/geographic/hotspots"),
    ("POST", "/api/v1/profiling/infer", {
        "weapon": "Knife or cutting instrument",
        "circumstance": "Lover triangle",
        "victim_sex": "Female",
        "victim_age": 28
    }),
    ("GET", "/api/v1/analytics/tamil-nadu/districts"),
    ("GET", "/api/v1/analytics/tamil-nadu/trends"),
    ("POST", "/api/v1/analytics/tamil-nadu/compare", {
        "district_a": "Chennai City",
        "district_b": "Madurai City"
    }),
]

print("=" * 60)
print("TESTING CRIMORA FASTAPI ENDPOINTS")
print("=" * 60)

passed = 0
for test in endpoints:
    method = test[0]
    path = test[1]
    body = test[2] if len(test) > 2 else None
    
    if method == "GET":
        res = client.get(path)
    else:
        res = client.post(path, json=body)
        
    if res.status_code == 200:
        print(f"  [PASS] {method} {path} => 200 OK")
        passed += 1
    else:
        print(f"  [FAIL] {method} {path} => {res.status_code}: {res.text}")

print(f"\nResult: {passed}/{len(endpoints)} endpoints passed.")
if passed != len(endpoints):
    sys.exit(1)
print("ALL BACKEND ENDPOINTS OPERATIONAL!")
