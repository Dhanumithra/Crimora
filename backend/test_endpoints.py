import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

try:
    from backend.app.main import app
except ModuleNotFoundError:
    from app.main import app

client = TestClient(app)

endpoints = [
    ("GET", "/health", None),
    ("GET", "/api/v1/overview/status", None),
    ("GET", "/api/v1/overview/executive", None),
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
    ("GET", "/api/v1/clustering/cold-cases?limit=5", None),
    ("GET", "/api/v1/clustering/distributions", None),
    ("GET", "/api/v1/geographic/hotspots", None),
    ("POST", "/api/v1/profiling/infer", {
        "weapon": "Knife or cutting instrument",
        "circumstance": "Lover triangle",
        "victim_sex": "Female",
        "victim_age": 28
    }),
    ("GET", "/api/v1/analytics/tamil-nadu/districts", None),
    ("GET", "/api/v1/analytics/tamil-nadu/trends", None),
    ("POST", "/api/v1/analytics/tamil-nadu/compare", {
        "district_a": "Chennai City",
        "district_b": "Madurai City"
    }),
]

@pytest.mark.parametrize("method,path,body", endpoints)
def test_endpoint(method, path, body):
    if method == "GET":
        res = client.get(path)
    else:
        res = client.post(path, json=body)
    assert res.status_code == 200, f"{method} {path} returned {res.status_code}: {res.text}"

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING CRIMORA FASTAPI ENDPOINTS")
    print("=" * 60)
    passed = 0
    for method, path, body in endpoints:
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

