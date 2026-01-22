# HRMS Lite

HRMS Lite is a lightweight Human Resource Management System designed to manage employee records and attendance. It provides a simple, intuitive interface for HR administrators to add employees, view their details, and track their daily attendance status.

## Project Overview

This application demonstrates a full-stack architecture separating concerns between a modern React frontend and a robust FastAPI backend. It features:

-   **Employee Management**: Create, view, delete, and list employees.
-   **Attendance Tracking**: Mark daily attendance (Present/Absent).
-   **Data Filtration**: Filter attendance records by date range.
-   **Dashboard Analytics**: View quick summaries of total employees and daily attendance.

## Tech Stack

### Frontend
-   **React**: UI Library.
-   **Vite**: Build tool and development server.
-   **Tailwind CSS**: Utility-first CSS framework for styling.
-   **Lucide React**: Icon set.
-   **Axios**: HTTP client for API requests.
-   **Vitest**: Blazing fast unit test framework.
-   **React Testing Library**: Testing utilities for React components.

### Backend
-   **FastAPI**: High-performance web framework for building APIs.
-   **SQLModel**: Database interaction (ORM) built on top of SQLAlchemy and Pydantic.
-   **SQLite**: Lightweight, file-based relational database.
-   **Pydantic**: Data validation and serialization.

## Setup Instructions

### Prerequisites
-   Python 3.9 or higher
-   Node.js (v14 or higher) and npm

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Start the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will run at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 2. Frontend Setup

1.  Open a new terminal and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## Testing

### Backend Tests

To run the backend integration tests:

1.  Ensure you have `pytest` and `httpx` (or `requests`) installed.
    ```bash
    pip install pytest httpx
    ```
2.  Run tests from the `backend` directory:
    ```bash
    pytest
    ```

### Frontend Tests

To run the frontend unit and integration tests:

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Run the tests using npm:
    ```bash
    npm test
    ```
    This uses **Vitest** to run the test suite, which includes component tests (Buttons), service tests (API integration), and page-level integration tests (Dashboard).

## Assumptions & Design Decisions

-   **Database**: SQLite is used for simplicity and ease of local setup. It creates a `database.db` file in the `backend` folder automatically on startup.
-   **Authentication**: No authentication is implemented for this version (open access).
-   **Date Handling**: Dates are stored as `YYYY-MM-DD` strings or Date objects. Timezones are assumed to be local or UTC for simplicity.
-   **Constraint**: An employee can only have one attendance record per day.
