import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // Employee Endpoints
    getEmployees: async () => {
        try {
            const response = await client.get('/employees/');
            // Map snake_case backend response to camelCase frontend model
            return response.data.map(emp => ({
                id: emp.id,
                fullName: emp.full_name,
                email: emp.email,
                department: emp.department
            }));
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    },

    getEmployee: async (id) => {
        try {
            const response = await client.get(`/employees/${id}`);
            const emp = response.data;
            return {
                id: emp.id,
                fullName: emp.full_name,
                email: emp.email,
                department: emp.department
            };
        } catch (error) {
             console.error(`Error fetching employee ${id}:`, error);
             throw error;
        }
    },

    addEmployee: async (employee) => {
        try {
            const payload = {
                id: employee.id,
                full_name: employee.fullName,
                email: employee.email,
                department: employee.department
            };
            const response = await client.post('/employees/', payload);
            const emp = response.data;
            return {
                id: emp.id,
                fullName: emp.full_name,
                email: emp.email,
                department: emp.department
            };
        } catch (error) {
            console.error("Error adding employee:", error);
            if (error.response && error.response.data && error.response.data.detail) {
                // Return a specific error message if backend provides one
                 throw new Error(JSON.stringify(error.response.data.detail));
            }
            throw new Error('Failed to add employee');
        }
    },

    deleteEmployee: async (id) => {
        try {
            await client.delete(`/employees/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting employee ${id}:`, error);
            throw error;
        }
    },

    // Attendance Endpoints
    getAttendance: async (employeeId, startDate = null, endDate = null) => {
        try {
            let url = `/attendance/${employeeId}`;
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            
            const queryString = params.toString();
            if (queryString) url += `?${queryString}`;

            const response = await client.get(url);
            // Map snake_case to camelCase
            return response.data.map(record => ({
                id: record.id,
                employeeId: record.employee_id,
                date: record.date,
                status: record.status
            }));
        } catch (error) {
            console.error(`Error fetching attendance for ${employeeId}:`, error);
            throw error;
        }
    },

    getEmployeeStats: async (employeeId) => {
        try {
            const response = await client.get(`/employees/${employeeId}/stats`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching stats for employee ${employeeId}:`, error);
            // Return default to avoid breaking UI
            return { total_present: 0 };
        }
    },

    getDashboardStats: async () => {
        try {
            const response = await client.get('/stats/dashboard');
            return response.data;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            return { total_employees: 0, present_today: 0 };
        }
    },

    addAttendance: async (record) => {
        try {
            const payload = {
                employee_id: record.employeeId,
                date: record.date,
                status: record.status
            };
            const response = await client.post('/attendance/', payload);
             const newRecord = response.data;
            return {
                id: newRecord.id,
                employeeId: newRecord.employee_id,
                date: newRecord.date,
                status: newRecord.status
            };
        } catch (error) {
            console.error("Error recording attendance:", error);
            throw error;
        }
    }
};
