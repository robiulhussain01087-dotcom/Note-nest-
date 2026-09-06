import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  BookOpen,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  currentPage?: string;
  currentRoute?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  currentRoute,
  onNavigate,
  onOpenAuth,
}) => {
  const activePage = currentRoute || currentPage || 'home';
  const isCurriculumActive = activePage === 'notes' || activePage === 'groups' || activePage === 'group-detail';
  const { user, logout, isAdmin, isCustomer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (page: string) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav('home')}
            className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <Logo size="md" showTagline={false} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activePage === 'home'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('notes')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isCurriculumActive
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Curriculum & Notes
            </button>

            {isCustomer && (
              <button
                onClick={() => handleNav('account')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activePage === 'account'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>My Purchases</span>
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* If Admin is logged in: show distinct Admin controls ONLY */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Active
                </span>
                <button
                  onClick={() => handleNav('admin')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors cursor-pointer"
                >
                  Admin Console
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Sign Out of Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* If Customer is logged in: show Customer controls ONLY (NEVER ADMIN) */}
            {isCustomer && user && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'S'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                    Student
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                          Student Account
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNav('account')}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Details</span>
                    </button>

                    <button
                      onClick={() => handleNav('account')}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>My Purchases</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* If Guest (Not logged in): Show Customer Login, Customer Register, and discreet Admin Portal */}
            {!user && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Customer Login
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  Customer Register
                </button>
                <button
                  onClick={() => handleNav('admin/login')}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Admin Portal"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800"
              >
                Admin
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in fade-in duration-150">
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleNav('home')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === 'home' ? 'bg-blue-50 text-blue-950 font-bold' : 'text-slate-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('notes')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                isCurriculumActive ? 'bg-blue-50 text-blue-950 font-bold' : 'text-slate-700'
              }`}
            >
              Curriculum & Notes
            </button>
            {isCustomer && (
              <button
                onClick={() => handleNav('account')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  activePage === 'account' ? 'bg-emerald-50 text-emerald-950 font-bold' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>My Purchases</span>
                </div>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {isAdmin && (
              <div className="space-y-2">
                <div className="p-3 bg-slate-900 rounded-xl text-white space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Mode Active</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 flex items-center justify-center gap-2"
                >
                  Open Admin Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}

            {isCustomer && user && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name[0].toUpperCase() : 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleNav('account')}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-blue-900" />
                  My Account & Profile
                </button>

                <button
                  onClick={() => handleNav('account')}
                  className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  My Purchased Notes & History
                </button>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}

            {!user && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNav('login');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-800 border border-slate-300 text-center"
                  >
                    Customer Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNav('register');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 text-center shadow-sm"
                  >
                    Customer Register
                  </button>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNav('admin/login');
                  }}
                  className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
