import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { api } from './api';

// Mock axios
const { mockGet, mockPost, mockDelete } = vi.hoisted(() => {
    return {
        mockGet: vi.fn(),
        mockPost: vi.fn(),
        mockDelete: vi.fn(),
    }
});

vi.mock('axios', () => {
    return {
        default: {
            create: vi.fn(() => ({
                get: mockGet,
                post: mockPost,
                delete: mockDelete,
                defaults: { headers: {} },
                interceptors: {
                    request: { use: vi.fn(), eject: vi.fn() },
                    response: { use: vi.fn(), eject: vi.fn() }
                }
            }))
        }
    };
});

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getEmployees', () => {
        it('fetches and transforms employees', async () => {
             const mockResponse = {
                data: [
                    { id: '1', full_name: 'John Doe', email: 'john@example.com', department: 'IT' }
                ]
            };
            mockGet.mockResolvedValue(mockResponse);

            const result = await api.getEmployees();

            expect(mockGet).toHaveBeenCalledWith('/employees/');
            expect(result).toEqual([
                { id: '1', fullName: 'John Doe', email: 'john@example.com', department: 'IT' }
            ]);
        });
        
        it('handles errors', async () => {
            mockGet.mockRejectedValue(new Error('Network Error'));
            await expect(api.getEmployees()).rejects.toThrow('Network Error');
        });
    });

    describe('addEmployee', () => {
        it('posts and transforms employee data', async () => {
            const newEmployee = { id: '1', fullName: 'Jane', email: 'jane@example.com', department: 'HR' };
            const mockResponse = {
                data: { id: '1', full_name: 'Jane', email: 'jane@example.com', department: 'HR' }
            };
            mockPost.mockResolvedValue(mockResponse);

            const result = await api.addEmployee(newEmployee);

            expect(mockPost).toHaveBeenCalledWith('/employees/', {
                id: '1',
                full_name: 'Jane',
                email: 'jane@example.com',
                department: 'HR'
            });
            expect(result).toEqual(newEmployee);
        });
    });
});
