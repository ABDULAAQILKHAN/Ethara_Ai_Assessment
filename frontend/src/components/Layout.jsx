import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, UserPlus, LayoutDashboard } from 'lucide-react';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
            </div>

            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    HRMS Lite
                                </span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                            isActive
                                                ? 'border-blue-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/add-employee"
                                    className={({ isActive }) =>
                                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                            isActive
                                                ? 'border-blue-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add Employee
                                </NavLink>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    A
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
