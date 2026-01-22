from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import pytest
from main import app
from database import get_session

# Setup in-memory DB for testing
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_create_employee(client: TestClient):
    response = client.post(
        "/employees/",
        json={"id": "EMP001", "full_name": "Test User", "email": "test@example.com", "department": "IT"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["id"] == "EMP001"

def test_create_employee_duplicate(client: TestClient):
    client.post(
        "/employees/",
        json={"id": "EMP001", "full_name": "Test User", "email": "test@example.com", "department": "IT"}
    )
    response = client.post(
        "/employees/",
        json={"id": "EMP001", "full_name": "Test User 2", "email": "test2@example.com", "department": "HR"}
    )
    # Expect 409 Conflict
    assert response.status_code == 409

def test_read_employee(client: TestClient):
    client.post(
        "/employees/",
        json={"id": "EMP001", "full_name": "Read User", "email": "read@example.com", "department": "IT"}
    )
    response = client.get("/employees/EMP001")
    assert response.status_code == 200
    assert response.json()["full_name"] == "Read User"

def test_read_employee_not_found(client: TestClient):
    response = client.get("/employees/NONEXISTENT")
    assert response.status_code == 404

def test_attendance_and_stats(client: TestClient):
    # Create employee
    client.post(
        "/employees/",
        json={"id": "EMP001", "full_name": "Att User", "email": "att@example.com", "department": "IT"}
    )
    
    # Add attendance
    response = client.post(
        "/attendance/",
        json={"employee_id": "EMP001", "date": "2023-01-01", "status": "Present"}
    )
    assert response.status_code == 201
    
    # Check stats
    response = client.get("/employees/EMP001/stats")
    assert response.status_code == 200
    assert response.json()["total_present"] == 1
    
    # Check dashboard stats
    response = client.get("/stats/dashboard")
    assert response.json()["total_employees"] == 1
