import os
import uuid

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL is missing")
BASE_URL = base_url.rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Module: root / status endpoints ---
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200
        assert r.json().get("message") == "Hello World"

    def test_status_create_and_list(self, api):
        name = f"TEST_{uuid.uuid4().hex[:8]}"
        r = api.post(f"{BASE_URL}/api/status", json={"client_name": name}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["client_name"] == name
        assert isinstance(d["id"], str) and len(d["id"]) > 0
        assert "_id" not in d

        g = api.get(f"{BASE_URL}/api/status", timeout=30)
        assert g.status_code == 200
        items = g.json()
        assert isinstance(items, list)
        assert any(i["client_name"] == name for i in items)
        assert all("_id" not in i for i in items)


# --- Module: contact brief (POST /api/contact + email via Resend proxy) ---
class TestContact:
    def test_submit_contact_success_and_emailed(self, api):
        name = f"TEST_Bot_{uuid.uuid4().hex[:6]}"
        payload = {"name": name, "email": "bot@example.com",
                   "message": "TEST_ automated brief message for QA."}
        r = api.post(f"{BASE_URL}/api/contact", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "success"
        assert d["emailed"] is True, f"email not delivered: {d}"

        # Persistence check via GET
        g = api.get(f"{BASE_URL}/api/contact", timeout=30)
        assert g.status_code == 200
        briefs = g.json()
        assert isinstance(briefs, list)
        match = [b for b in briefs if b["name"] == name]
        assert match, "submitted brief not persisted"
        b = match[0]
        assert b["email"] == "bot@example.com"
        assert b["message"] == payload["message"]
        assert "_id" not in b
        assert "created_at" in b and "id" in b

    @pytest.mark.parametrize("payload,desc", [
        ({"name": "", "email": "a@b.com", "message": "hi"}, "empty name"),
        ({"name": "x", "email": "not-an-email", "message": "hi"}, "bad email"),
        ({"name": "x", "email": "a@b.com", "message": ""}, "empty message"),
        ({"email": "a@b.com", "message": "hi"}, "missing name"),
        ({"name": "x" * 200, "email": "a@b.com", "message": "hi"}, "name too long"),
    ])
    def test_submit_contact_validation(self, api, payload, desc):
        r = api.post(f"{BASE_URL}/api/contact", json=payload, timeout=30)
        assert r.status_code == 422, f"{desc} -> {r.status_code} {r.text[:200]}"

    def test_contact_list_sorted_desc(self, api):
        g = api.get(f"{BASE_URL}/api/contact", timeout=30)
        assert g.status_code == 200
        items = g.json()
        dates = [i["created_at"] for i in items]
        assert dates == sorted(dates, reverse=True)
