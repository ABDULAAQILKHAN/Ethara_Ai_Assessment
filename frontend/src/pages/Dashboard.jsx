import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { Trash2, Eye, UserPlus, CheckCircle } from 'lucide-react';

export default function Dashboard() {
    const [employees, setEmployees] = useState([]);
    const [stats, setStats] = useState({ total_employees: 0, present_today: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const [empData, statsData] = await Promise.all([
                 api.getEmployees(),
                 api.getDashboardStats()
            ]);
            setEmployees(empData);
            setStats(statsData);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load employees. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        
        try {
            setDeletingId(id);
            await api.deleteEmployee(id);
            setEmployees(employees.filter(e => e.id !== id));
        } catch (err) {
            alert('Failed to delete employee');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <Loader size="large" className="h-64" />;

    if (error) return (
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchEmployees} variant="outline">Retry</Button>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                <Link to="/add-employee">
                    <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New Employee
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <UserPlus className="w-8 h-8" /> 
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Employees</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_employees}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Present Today</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.present_today}</p>
                    </div>
                </div>
            </div>

            {employees.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <UserPlus className="h-12 w-12" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new employee.</p>
                    <div className="mt-6">
                        <Link to="/add-employee">
                            <Button variant="primary">Add Employee</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {employee.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {employee.fullName.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                                                <div className="text-sm text-gray-500">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {employee.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/employee/${employee.id}`} className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center">
                                            <Eye className="w-4 h-4 mr-1" /> View
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(employee.id)} 
                                            disabled={deletingId === employee.id}
                                            className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50"
                                        >
                                            {deletingId === employee.id ? (
                                                <span className="animate-spin mr-1">...</span>
                                            ) : (
                                                <Trash2 className="w-4 h-4 mr-1" />
                                            )}
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
