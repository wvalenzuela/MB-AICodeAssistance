import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Landmark, 
  LogIn, 
  LogOut, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Check, 
  Copy,
  Building2,
  FolderGit2
} from 'lucide-react';
import LoginModal from './LoginModal';

export interface TopBarProps {
  onToggleNav?: () => void;
  currentUserEmail?: string;
  currentUserName?: string;
  userEmail?: string;
  userName?: string;
  unitId?: string;
  onShowToast?: (message: string) => void;
  onLoginSuccess?: (email: string, displayName: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onToggleNav,
  currentUserEmail = 'waldo.valenzuela.pinilla@gmail.com',
  currentUserName = 'Waldo Valenzuela',
  userEmail,
  userName,
  unitId = 'UNIT-MD-08',
  onShowToast,
  onLoginSuccess,
}) => {
  const activeEmail = userEmail || currentUserEmail;
  const activeName = userName || currentUserName;

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [localEmail, setLocalEmail] = useState(activeEmail);
  const [localName, setLocalName] = useState(activeName);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  useEffect(() => {
    if (activeEmail) setLocalEmail(activeEmail);
  }, [activeEmail]);

  useEffect(() => {
    if (activeName) setLocalName(activeName);
  }, [activeName]);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    onShowToast?.('Logged out of Medical-Blocks session');
  };

  const handleOpenLoginModal = () => {
    setIsMenuOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (email: string, displayName: string) => {
    setLocalEmail(email);
    setLocalName(displayName);
    setIsLoggedIn(true);
    onLoginSuccess?.(email, displayName);
  };

  const handleCopyToken = () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.waldo.valenzuela.clinical.cluster.mb-md-08.token';
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
    onShowToast?.('Auth Bearer token copied to clipboard');
  };

  const initials = localName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-12 w-full bg-[#00486b] text-white flex items-center justify-between px-3 sm:px-4 shrink-0 select-none z-30 shadow-xs">
      {/* Left side: Hamburger & Medical-Blocks Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleNav}
          className="p-1 text-white/90 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
          title="Toggle Navigation"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Landmark className="w-6 h-6 text-white stroke-[2.2]" />
          <span className="font-bold text-lg tracking-tight text-white">
            Medical-Blocks
          </span>
        </div>
      </div>

      {/* Right side: Help, Notifications, and Login / User Account Area */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Help Icon Button */}
        <button
          type="button"
          onClick={() => onShowToast?.('Medical-Blocks Documentation & Cohort Guides')}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Help & Support"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        {/* Notifications Bell with Badge */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#00486b]" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-zinc-800 rounded-xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">Notifications</span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded-full">1 New</span>
              </div>
              <div className="p-3 text-xs space-y-2.5">
                <div className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-100">
                  <div className="font-medium text-sky-950 text-xs">AI Workspace Synchronized</div>
                  <div className="text-[11px] text-sky-700 mt-0.5">Session linked to <code>/Users/waldo/Documents/AnonymousData</code></div>
                </div>
                <div className="p-2 text-zinc-500 text-[11px]">
                  No pending cohort ratings assigned to you.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-white/20 mx-0.5" />

        {/* Login / User Profile Area */}
        {isLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 py-1 px-1.5 sm:px-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-left"
              title={`Logged in as ${localName} (${localEmail})`}
            >
              {/* User Avatar with Initials & Online Dot */}
              <div className="relative flex items-center justify-center w-7.5 h-7.5 rounded-full bg-white/20 text-white font-semibold text-xs border border-white/30 shadow-2xs">
                <span>{initials}</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#00486b] rounded-full" />
              </div>

              {/* User Name & Unit */}
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-medium text-white truncate max-w-[130px]">
                  {localName}
                </span>
                <span className="text-[10px] text-white/70 truncate max-w-[130px]">
                  {unitId}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            {/* Account & Login Popover Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-zinc-800 rounded-xl shadow-2xl border border-zinc-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* User Header Profile */}
                <div className="px-4 py-2 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00486b] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-zinc-900 text-sm truncate">{localName}</div>
                      <div className="text-zinc-500 text-xs truncate">{localEmail}</div>
                      <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span>Signed in & Authorized</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization & Location Meta */}
                <div className="px-4 py-2.5 text-xs space-y-2 border-b border-zinc-100 text-zinc-600 bg-zinc-50/50">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Unit / Project:</span>
                    </span>
                    <span className="font-mono font-medium text-zinc-800">{unitId} / PRJ-NEUROSCAN</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Workspace:</span>
                    </span>
                    <span className="font-mono text-[11px] text-zinc-700 truncate max-w-[160px]" title="/Users/waldo/Documents/AnonymousData">
                      .../AnonymousData
                    </span>
                  </div>
                </div>

                {/* JWT Token & Credential Details */}
                <div className="px-4 py-2.5 border-b border-zinc-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>JWT Bearer Token</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 font-medium cursor-pointer"
                    >
                      {tokenCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Token</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-zinc-100 rounded p-1.5 text-[10px] font-mono text-zinc-600 truncate">
                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.waldo.valenzuela...
                  </div>
                </div>

                {/* Switch Account or Re-login Action */}
                <div className="px-2 pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={handleOpenLoginModal}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <LogIn className="w-4 h-4 text-zinc-500" />
                    <span>Switch account / Sign in with credentials</span>
                  </button>

                  {/* Sign Out Action */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out of Medical-Blocks</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Logged Out State: Prominent Log In Button */
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenLoginModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer border border-white/20"
              title="Sign In to Medical-Blocks"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>

      {/* Login Dialog for Email & Password */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultEmail={localEmail}
        onShowToast={onShowToast}
      />
    </header>
  );
};

export default TopBar;
