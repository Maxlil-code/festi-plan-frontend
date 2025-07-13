import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Badge } from './';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import { 
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChatBubbleBottomCenterIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: CalendarIcon,
      roles: ['organizer', 'provider', 'admin'],
    },
    {
      name: 'Events',
      href: '/events',
      icon: CalendarIcon,
      roles: ['organizer'],
    },
    {
      name: 'Venues',
      href: '/venues',
      icon: BuildingOfficeIcon,
      roles: ['organizer', 'provider'],
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: ChatBubbleBottomCenterIcon,
      roles: ['organizer', 'provider'],
    },
    {
      name: 'Socket Test',
      href: '/socket-test',
      icon: ChatBubbleBottomCenterIcon,
      roles: ['organizer', 'provider', 'admin'],
    },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(role)
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
                EventPlanner
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            {role === 'organizer' && (
              <Button
                as={Link}
                to="/events/new"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                New Event
              </Button>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                      <div className="text-gray-500 text-xs capitalize">{role}</div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Profile Settings
                    </Link>
                    
                    <Link
                      to="/notifications"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Notifications
                    </Link>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 inline mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {role === 'organizer' && (
                <Link
                  to="/events/new"
                  onClick={() => setIsMenuOpen(false)}
                  className="block pl-3 pr-4 py-2 text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50"
                >
                  <CalendarIcon className="h-5 w-5 inline mr-3" />
                  Create Event
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
