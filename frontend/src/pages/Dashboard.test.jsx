import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { api } from '../services/api';

// Mock the api service
vi.mock('../services/api', () => ({
    api: {
        getEmployees: vi.fn(),
        deleteEmployee: vi.fn()
    }
}));

// Mock Link component since we are using Router
const MockDashboard = () => (
    <BrowserRouter>
        <Dashboard />
    </BrowserRouter>
);

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        // Return a promise that never resolves pending
        api.getEmployees.mockImplementation(() => new Promise(() => {}));
        render(<MockDashboard />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders empty state when no employees', async () => {
        api.getEmployees.mockResolvedValue([]);
        render(<MockDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('No employees')).toBeInTheDocument();
        });
    });

    it('renders employee list when data is available', async () => {
        const mockEmployees = [
            { id: '1', fullName: 'Alice', email: 'alice@test.com', department: 'HR' },
            { id: '2', fullName: 'Bob', email: 'bob@test.com', department: 'IT' }
        ];
        api.getEmployees.mockResolvedValue(mockEmployees);
        
        render(<MockDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Bob')).toBeInTheDocument();
        });
    });

    it('handles error state', async () => {
        api.getEmployees.mockRejectedValue(new Error('Failed to fetch'));
        render(<MockDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText(/Failed to load employees/i)).toBeInTheDocument();
        });
    });

    it('deletes an employee', async () => {
        const mockEmployees = [
            { id: '1', fullName: 'Alice', email: 'alice@test.com', department: 'HR' }
        ];
        api.getEmployees.mockResolvedValue(mockEmployees);
        api.deleteEmployee.mockResolvedValue(true);
        
        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
        
        render(<MockDashboard />);
        
        // Wait for list to load
        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
        });
        
        // Find delete button
        const deleteBtn = screen.getByText('Delete');
        fireEvent.click(deleteBtn);
        
        await waitFor(() => {
             expect(api.deleteEmployee).toHaveBeenCalledWith('1');
        });
        
        // Verify optimistic UI update or refetch (code does optimistic update)
        await waitFor(() => {
             expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        });
        
        confirmSpy.mockRestore();
    });
});
