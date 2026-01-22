import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AddEmployee() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        id: '',
        fullName: '',
        email: '',
        department: 'Engineering'
    });

    // Validations State
    const [errors, setErrors] = useState({});

    const departments = [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'HR', label: 'Human Resources' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Finance', label: 'Finance' }
    ];

    const validate = () => {
        const newErrors = {};
        if (!formData.id.trim()) newErrors.id = 'Employee ID is required';
        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGlobalError(null);
        
        if (!validate()) return;

        setIsLoading(true);
        try {
            await api.addEmployee(formData);
            navigate('/');
        } catch (err) {
            setGlobalError(err.message || 'Failed to add employee');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Employee</h1>
                
                {globalError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                        {globalError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Employee ID"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        placeholder="e.g. EMP004"
                        error={errors.id}
                    />

                    <Input
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        error={errors.fullName}
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        error={errors.email}
                    />

                    <Select
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        options={departments}
                        error={errors.department}
                    />

                    <div className="mt-6 flex gap-3">
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            variant="primary"
                            className="w-full sm:w-auto"
                        >
                            Create Employee
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/')}
                           className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
