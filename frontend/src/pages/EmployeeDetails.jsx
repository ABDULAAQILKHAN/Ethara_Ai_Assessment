import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { Select, Input } from '../components/ui/Input';
import { ArrowLeft, User, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function EmployeeDetails() {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters and Stats State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState({ total_present: 0 });

    // Form state for marking attendance
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Present');

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch employee, attendance with filters, and stats
            const [empData, attData, statsData] = await Promise.all([
                api.getEmployee(id),
                api.getAttendance(id, startDate, endDate),
                api.getEmployeeStats(id)
            ]);
            setEmployee(empData);
            setAttendance(attData);
            setStats(statsData);
        } catch (err) {
            console.error(err);
            setError('Failed to load employee details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, startDate, endDate]);

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Update local optimistic UI or re-fetch
            const record = { employeeId: id, date, status };
            await api.addAttendance(record);
            
            // Refresh list
            const updatedList = await api.getAttendance(id);
            setAttendance(updatedList);
            
        } catch (err) {
            alert('Failed to mark attendance');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Loader size="large" className="h-64" />;
    
    if (error) return (
        <div className="text-center p-8">
            <h2 className="text-red-600 text-xl font-bold">{error}</h2>
            <Link to="/" className="text-blue-600 hover:underline mt-4 block">Back to Dashboard</Link>
        </div>
    );

    if (!employee) return <div>Employee not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>

            {/* Employee Info Card */}
            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                            {employee.fullName.charAt(0)}
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
                            <div className="flex items-center text-gray-500 mt-1">
                                <User className="w-4 h-4 mr-1" />
                                {employee.department} &bull; {employee.email}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">ID: {employee.id}</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end justify-center mt-4 sm:mt-0">
                        <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-100 text-center">
                            <span className="block text-xs text-green-600 font-semibold uppercase tracking-wide">Total Days Present</span>
                            <span className="block text-2xl font-bold text-green-700">{stats.total_present}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Attendance Form */}
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200 md:col-span-1 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Mark Attendance
                    </h2>
                    <form onSubmit={handleMarkAttendance}>
                        <Input 
                            label="Date"
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <Select 
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            options={[
                                { value: 'Present', label: 'Present' },
                                { value: 'Absent', label: 'Absent' }
                            ]}
                        />
                        <Button 
                            type="submit" 
                            isLoading={isSubmitting} 
                            className="w-full mt-2"
                        >
                            Save Record
                        </Button>
                    </form>
                </div>

                {/* Attendance History List */}
                <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 md:col-span-2">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-900">Attendance History</h3>
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-500">Filter:</span>
                            <Input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                                className="h-8 text-sm w-36"
                                placeholder="Start Date"
                            />
                            <span className="text-gray-400">-</span>
                            <Input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                                className="h-8 text-sm w-36"
                                placeholder="End Date"
                            />
                            {(startDate || endDate) && (
                                <button 
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="text-xs text-blue-600 hover:underline ml-2"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    {attendance.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No attendance records found.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {attendance.map((record, idx) => (
                                    <tr key={`${record.date}-${idx}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                record.status === 'Present' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {record.status === 'Present' ? (
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                )}
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
