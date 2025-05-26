


import React, { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { AppContextType, Entry, EntryType, PasswordEntry, UserPlan, Web3KeyEntry, PaystackProps } from './types'; // This types.ts is the root one
// Ensure this path is correct if ui.tsx is intended to consume the Expo app's context.
// This is unusual; ui.tsx typically would have its own context or be part of a separate web app.
// Fix: useAppContext will be exported from AppDataContext.tsx
import { useAppContext } from './src/contexts/AppDataContext';

// --- Constants for UI ---
const PAYSTACK_PUBLIC_KEY_WEB = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // DISTINCT WEB TEST KEY
const PAYMENT_AMOUNT_WEB = 480000; // ₦4800 in kobo
const FREE_PLAN_LIMIT_WEB = 5;

// --- Icon Components (Heroicons SVGs) ---
const IconClipboard = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const IconEye = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconEyeSlash = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const IconPencil = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const IconTrash = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.223.22C7.337 5.868 7.99 6.501 8.268 7.316l2.084 5.191m2.084-5.191L12.528 5.79m2.084 5.191L15.232 5.79" />
  </svg>
);

const IconPlus = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconKey = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const IconLockClosed = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const IconArrowUpCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconUserCircle = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconGlobeAlt = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M15 7.5a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconTag = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const IconWallet = ({ className = "w-6 h-6" }: { className?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6.062c0 .64.093 1.26.274 1.855A1.875 1.875 0 0118.25 21H5.75A1.875 1.875 0 013.875 19.917C3.967 19.322 4.06 18.7 4.06 18.062V12m16.94-2.25A2.25 2.25 0 0018.75 7.5H5.25A2.25 2.25 0 003 9.75M21 12H3" />
</svg>
);

const IconSparkles = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 9.75L17.437 12.563a4.5 4.5 0 01-3.09 3.09L11.5 16.5l2.846.813a4.5 4.5 0 013.09 3.09L18.25 23.25l.813-2.846a4.5 4.5 0 013.09-3.09L24.75 16.5l-2.846-.813a4.5 4.5 0 01-3.09-3.09z" />
  </svg>
);


const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8" role="status" aria-label="Loading content">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
  </div>
);

// --- Reusable UI Components ---
interface CardActionButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
  title?: string;
}
const CardActionButton: React.FC<CardActionButtonProps> = ({ onClick, children, className, ariaLabel, title }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    title={title || ariaLabel}
    className={`p-2 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-brand-lavender transition-colors ${className}`}
  >
    {children}
  </button>
);

interface InfoRowProps {
  label: string;
  value?: string;
  isSensitive?: boolean;
  revealed?: boolean;
  onCopy?: (valueToCopy: string) => void;
  truncate?: boolean;
  Icon?: React.ElementType;
}
const InfoRow: React.FC<InfoRowProps> = ({ label, value, isSensitive, revealed, onCopy, truncate = false, Icon }) => {
  if (!value) return null;

  const displayValue = isSensitive && !revealed ? '••••••••••••' : value;
  const valueClass = truncate ? "truncate block" : "break-all";

  const handleCopy = () => {
    if (onCopy && value) {
        onCopy(value);
         alert(`${label} copied to clipboard!`);
    }
  };

  return (
    <div className="mb-3">
      <span className="text-xs text-slate-300/80 block flex items-center">
        {Icon && <Icon className="w-3 h-3 mr-1.5 text-brand-lavender" />}
        {label}
      </span>
      <div className="flex items-center justify-between group">
        <span className={`text-sm font-medium text-slate-100 ${valueClass} ${isSensitive && !revealed && 'italic'}`}>{displayValue}</span>
        {onCopy && value && (
          <CardActionButton onClick={handleCopy} ariaLabel={`Copy ${label}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <IconClipboard className="w-4 h-4" />
          </CardActionButton>
        )}
      </div>
    </div>
  );
};

export const Navbar: React.FC = () => {
  const { plan, entries, isLoading } = useAppContext();

  if (isLoading) { // Don't show plan-dependent UI until plan is loaded
    return (
       <nav className="bg-slate-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
             <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-purple-gradient">
              SEEFA
            </Link>
            <div className="animate-pulse flex space-x-4">
                <div className="h-8 w-28 bg-slate-700 rounded-md"></div>
                <div className="h-8 w-24 bg-slate-700 rounded-md"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isFreeLimitReached = plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT_WEB;

  return (
    <nav className="bg-slate-800 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-purple-gradient">
            SEEFA
          </Link>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {plan === UserPlan.Free && (
              <Link
                to="/upgrade"
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center
                  ${isFreeLimitReached ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-brand-purple hover:bg-brand-dark-purple text-white'}`}
              >
                <IconArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                Upgrade
              </Link>
            )}
            {plan === UserPlan.Pro && (
              <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-green-600 text-white flex items-center" title="Pro Plan Active">
                <IconSparkles className="w-4 h-4 mr-1.5 text-yellow-300" />
                PRO
              </span>
            )}
             <Link
                to="/add"
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center"
                title="Add New Entry"
              >
                <IconPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> <span className="hidden sm:inline">New Entry</span><span className="sm:hidden">Add</span>
              </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const LimitNotice: React.FC = () => {
  const { plan, entries, isLoading } = useAppContext();

  if (isLoading || plan === UserPlan.Pro || entries.length < FREE_PLAN_LIMIT_WEB) {
    return null;
  }

  return (
    <div className="bg-yellow-500/20 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-lg mb-6 text-center" role="alert">
      <p className="font-semibold">Free Plan Limit Reached!</p>
      <p className="text-sm">You've saved {entries.length} out of {FREE_PLAN_LIMIT_WEB} allowed entries.</p>
      <Link to="/upgrade" className="mt-2 inline-block bg-brand-purple hover:bg-brand-dark-purple text-white font-bold py-2 px-4 rounded transition-colors text-sm">
        Upgrade to Pro for Unlimited Entries
      </Link>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDestructive?: boolean;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    isDestructive = true
}) => {
  if (!isOpen) return null;

  const confirmButtonClass = isDestructive
    ? "bg-red-600 hover:bg-red-700"
    : "bg-brand-purple hover:bg-brand-dark-purple";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 id="modal-title" className="text-xl font-semibold mb-4 text-slate-100">{title}</h3>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
            aria-label={cancelButtonText}
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white ${confirmButtonClass} transition-colors`}
            aria-label={confirmButtonText}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Card Components ---
const PasswordCard: React.FC<{ entry: PasswordEntry }> = ({ entry }) => {
  const { deleteEntry } = useAppContext(); // Assuming deleteEntry doesn't return a promise or its result is not used here.
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).catch(err => console.error('Failed to copy: ', err));
  };

  const handleDelete = () => {
    deleteEntry(entry.id); // For web context, assuming this is synchronous or fire-and-forget
    setShowDeleteModal(false);
    // Add toast notification here if implemented
  };

  return (
    <>
      <div className="bg-card-gradient p-5 rounded-xl shadow-2xl text-white w-full max-w-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full filter blur-xl opacity-50"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <IconLockClosed className="w-5 h-5 mr-2 opacity-80" />
                {entry.appName}
              </h3>
              {entry.category && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full inline-block mt-1">{entry.category}</span>}
            </div>
            <div className="flex space-x-1">
              <CardActionButton onClick={() => setRevealed(!revealed)} ariaLabel={revealed ? "Hide password" : "Reveal password"} title={revealed ? "Hide" : "Reveal"}>
                {revealed ? <IconEyeSlash /> : <IconEye />}
              </CardActionButton>
              <CardActionButton onClick={() => navigate(`/edit/${entry.id}`)} ariaLabel="Edit entry" title="Edit">
                <IconPencil />
              </CardActionButton>
              <CardActionButton onClick={() => setShowDeleteModal(true)} ariaLabel="Delete entry" title="Delete">
                <IconTrash />
              </CardActionButton>
            </div>
          </div>

          <InfoRow label="Username" value={entry.username} onCopy={handleCopy} Icon={IconUserCircle} />
          <InfoRow label="Password" value={entry.passwordValue} isSensitive revealed={revealed} onCopy={handleCopy} Icon={IconKey}/>
          {entry.websiteUrl && <InfoRow label="Website URL" value={entry.websiteUrl} onCopy={handleCopy} truncate Icon={IconGlobeAlt}/>}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Password Entry?"
        message={`Are you sure you want to delete the entry for "${entry.appName}"? This action cannot be undone.`}
        confirmButtonText="Delete"
      />
    </>
  );
};

const Web3KeyCard: React.FC<{ entry: Web3KeyEntry }> = ({ entry }) => {
  const { deleteEntry } = useAppContext(); // Assuming deleteEntry doesn't return a promise
  const navigate = useNavigate();
  // Fix: Change revealedFields to revealed, which is the state variable for this component
  const [revealed, setRevealed] = useState<{ [key: string]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).catch(err => console.error('Failed to copy: ', err));
  };

  const toggleReveal = (key: string) => {
    // Fix: Change revealedFields to revealed
    setRevealed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDelete = () => {
    deleteEntry(entry.id); // For web context
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-card-gradient p-5 rounded-xl shadow-2xl text-white w-full max-w-md relative overflow-hidden">
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/5 rounded-full filter blur-lg opacity-60"></div>
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                <h3 className="text-xl font-bold flex items-center">
                    <IconWallet className="w-5 h-5 mr-2 opacity-80" />
                    {entry.label}
                </h3>
                <p className="text-sm text-slate-200/90">{entry.walletName}</p>
                {entry.category && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full inline-block mt-1">{entry.category}</span>}
                </div>
                <div className="flex space-x-1">
                {/* General reveal/hide for all sensitive fields could be complex, manage per field or accept all revealed */}
                <CardActionButton onClick={() => navigate(`/edit/${entry.id}`)} ariaLabel="Edit Web3 Key" title="Edit">
                    <IconPencil />
                </CardActionButton>
                <CardActionButton onClick={() => setShowDeleteModal(true)} ariaLabel="Delete Web3 Key" title="Delete">
                    <IconTrash />
                </CardActionButton>
                </div>
            </div>

            {entry.projectName && <InfoRow label="Project Name" value={entry.projectName} onCopy={handleCopy} Icon={IconTag}/>}
            {entry.secretPhrase && (
                <div>
                    {/* Fix: Change revealedFields to revealed */}
                    <InfoRow label="Secret Phrase" value={entry.secretPhrase} isSensitive revealed={revealed['secretPhrase']} onCopy={handleCopy} Icon={IconKey}/>
                    <button onClick={() => toggleReveal('secretPhrase')} className="text-xs text-brand-lavender hover:underline mb-2 ml-1">
                        {/* Fix: Change revealedFields to revealed */}
                        {revealed['secretPhrase'] ? 'Hide' : 'Reveal'} Phrase
                    </button>
                </div>
            )}
            {entry.secretKey && (
                 <div>
                    {/* Fix: Change revealedFields to revealed */}
                    <InfoRow label="Secret Key" value={entry.secretKey} isSensitive revealed={revealed['secretKey']} onCopy={handleCopy} Icon={IconKey}/>
                    <button onClick={() => toggleReveal('secretKey')} className="text-xs text-brand-lavender hover:underline mb-2 ml-1">
                        {/* Fix: Change revealedFields to revealed */}
                        {revealed['secretKey'] ? 'Hide' : 'Reveal'} Key
                    </button>
                </div>
            )}
            {entry.pinCode && (
                <div>
                    {/* Fix: Change revealedFields to revealed */}
                    <InfoRow label="PIN Code" value={entry.pinCode} isSensitive revealed={revealed['pinCode']} onCopy={handleCopy} Icon={IconLockClosed}/>
                     <button onClick={() => toggleReveal('pinCode')} className="text-xs text-brand-lavender hover:underline mb-2 ml-1">
                        {/* Fix: Change revealedFields to revealed */}
                        {revealed['pinCode'] ? 'Hide' : 'Reveal'} PIN
                    </button>
                </div>
            )}
            {entry.websiteUrl && <InfoRow label="Website URL" value={entry.websiteUrl} onCopy={handleCopy} truncate Icon={IconGlobeAlt}/>}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Web3 Key Entry?"
        message={`Are you sure you want to delete the entry for "${entry.label}"? This action cannot be undone.`}
        confirmButtonText="Delete"
      />
    </>
  );
};


// --- Screen Components ---
export const HomeScreen: React.FC = () => {
  const { entries, isLoading, plan } = useAppContext();
  const [filter, setFilter] = useState<EntryType | 'all'>('all');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const filteredEntries = entries.filter(entry => filter === 'all' || entry.type === filter);

  return (
    <div className="space-y-8">
      <LimitNotice />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Your Entries ({filteredEntries.length})</h1>
        <div className="flex space-x-2 p-1 bg-slate-800 rounded-lg">
          {(['all', EntryType.Password, EntryType.Web3Key] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${filter === type ? 'bg-brand-purple text-white' : 'text-slate-300 hover:bg-slate-700'}`}
              aria-pressed={filter === type}
            >
              {type === 'all' ? 'All' : type === EntryType.Password ? 'Passwords' : 'Web3 Keys'}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <IconKey className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-300 mb-2">No Entries Yet</h2>
          <p className="text-slate-400 mb-6">Start by adding your first password or Web3 key.</p>
          <Link
            to="/add"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg inline-flex items-center"
          >
            <IconPlus className="w-5 h-5 mr-2" /> Add New Entry
          </Link>
        </div>
      ) : filteredEntries.length === 0 ? (
         <div className="text-center py-12">
          <IconKey className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-300 mb-2">No {filter === EntryType.Password ? 'Passwords' : 'Web3 Keys'} Found</h2>
          <p className="text-slate-400 mb-6">You don't have any {filter === EntryType.Password ? 'password' : 'Web3 key'} entries yet, or they don't match your current filter.</p>
           <button
              onClick={() => setFilter('all')}
              className="bg-brand-purple hover:bg-brand-dark-purple text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg inline-flex items-center"
            >
              Show All Entries
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEntries.sort((a,b) => b.createdAt - a.createdAt).map(entry => // Root types.ts doesn't have createdAt
            entry.type === EntryType.Password ? (
              <PasswordCard key={entry.id} entry={entry as PasswordEntry} />
            ) : (
              <Web3KeyCard key={entry.id} entry={entry as Web3KeyEntry} />
            )
          )}
        </div>
      )}
    </div>
  );
};

const commonInputClass = "w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-colors text-slate-100 placeholder-slate-400";
const commonLabelClass = "block text-sm font-medium text-slate-300 mb-1";

type FormDataFields = Partial<
  Omit<PasswordEntry, 'type' | 'createdAt'> & // Root types.ts BaseEntry doesn't have createdAt
  Omit<Web3KeyEntry, 'type' | 'createdAt'>   // Root types.ts BaseEntry doesn't have createdAt
> & { id?: string };

export const AddEntryScreen: React.FC = () => {
  const { addEntry, updateEntry, getEntryById, plan, entries } = useAppContext(); // Context methods might expect promise handling.
  const navigate = useNavigate();
  const { id: editingId } = useParams<{ id: string }>();

  const [entryType, setEntryType] = useState<EntryType>(EntryType.Password);
  const [formData, setFormData] = useState<FormDataFields>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(editingId);
  const isFreeLimitReached = plan === UserPlan.Free && entries.length >= FREE_PLAN_LIMIT_WEB && !isEditing;


  useEffect(() => {
    if (isEditing && editingId) {
      setIsLoading(true);
      const entryToEdit = getEntryById(editingId); // getEntryById from context
      if (entryToEdit) {
        setEntryType(entryToEdit.type);
        setFormData(entryToEdit); // This can be problematic if Entry and FormDataFields mismatch significantly
      } else {
        setError("Entry not found.");
        navigate('/');
      }
      setIsLoading(false);
    } else {
       setFormData({});
    }
  }, [editingId, getEntryById, navigate, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => { // Changed to async to align with context methods
    e.preventDefault();
    setError(null);

    if (isFreeLimitReached) {
      setError(`Free plan limit of ${FREE_PLAN_LIMIT_WEB} entries reached. Please upgrade to add more.`);
      return;
    }

    setIsLoading(true);

    try {
        if (isEditing && editingId) {
            // The AppContext updateEntry expects the full updated entry.
            // However, the current AppContextType in types.ts shows:
            // updateEntry: (updatedEntry: Entry) => void;
            // This seems to be a mismatch with the one in src/types/index.ts which is:
            // updateEntry: (id: string, entryData: Partial<EntryFormData>) => Promise<boolean>;
            // Assuming the root types.ts is for this ui.tsx, let's adjust the call
            // to match that `updateEntry: (updatedEntry: Entry) => void;`
            // This ui.tsx is likely for a web version and might have a simpler context definition or usage.
            // Given `AppContextType` from `./types` (root), it's (updatedEntry: Entry).
            // We need to construct the full Entry object for update.
            const entryToUpdate: Entry = {
                ...formData,
                id: editingId,
                type: entryType,
                createdAt: getEntryById(editingId)?.createdAt || Date.now(), // Preserve original createdAt or use now
            } as Entry; // Cast, ensuring all required fields are present
            
            if (entryType === EntryType.Password) {
                const passEntry = entryToUpdate as PasswordEntry;
                if (!passEntry.appName || !passEntry.username || !passEntry.passwordValue) {
                    throw new Error("App Name, Username, and Password are required for password entries.");
                }
            } else {
                const web3Entry = entryToUpdate as Web3KeyEntry;
                if (!web3Entry.label || !web3Entry.walletName) {
                    throw new Error("Label and Wallet Name are required for Web3 key entries.");
                }
            }
            updateEntry(entryToUpdate); 
            alert('Entry updated successfully!');
        } else {
            let success;
            // addEntry: (entry: Omit<PasswordEntry, 'id' | 'type' | 'createdAt'> | Omit<Web3KeyEntry, 'id' | 'type' | 'createdAt'>, type: EntryType) => boolean;
            const entryDataForContext = { ...formData };
            
            if (entryType === EntryType.Password) {
                if (!formData.appName || !formData.username || !formData.passwordValue) {
                    throw new Error("App Name, Username, and Password are required for password entries.");
                }
                success = addEntry(entryDataForContext as Omit<PasswordEntry, 'id'|'type'|'createdAt'>, EntryType.Password);
            } else {
                 if (!formData.label || !formData.walletName) {
                    throw new Error("Label and Wallet Name are required for Web3 key entries.");
                }
                success = addEntry(entryDataForContext as Omit<Web3KeyEntry, 'id'|'type'|'createdAt'>, EntryType.Web3Key);
            }
             if (success) {
                alert('Entry added successfully!');
            } else {
                setError("Failed to add entry. You might have reached your plan limit.");
                setIsLoading(false);
                return;
            }
        }
        navigate('/');
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading && isEditing) return <LoadingSpinner />;
  if (error && isEditing && !formData.id) return <p className="text-red-500 text-center">{error}</p>;


  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold text-slate-100 mb-6 text-center">{isEditing ? 'Edit Entry' : 'Add New Entry'}</h1>

      {error && <p className="text-red-400 bg-red-500/20 p-3 rounded-md mb-4 text-sm">{error}</p>}
      {isFreeLimitReached && (
         <div className="bg-yellow-500/20 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-lg mb-6 text-sm">
          <p><span className="font-semibold">Free Plan Limit Reached:</span> You cannot add new entries. Please <Link to="/upgrade" className="font-bold underline hover:text-yellow-200">upgrade to Pro</Link>.</p>
        </div>
      )}

      {!isEditing && (
        <div className="mb-6">
          <label className={commonLabelClass}>Entry Type</label>
          <select
            name="entryType"
            value={entryType}
            onChange={(e) => setEntryType(e.target.value as EntryType)}
            className={commonInputClass}
            aria-label="Select entry type"
            disabled={isEditing}
          >
            <option value={EntryType.Password}>Password</option>
            <option value={EntryType.Web3Key}>Web3 Key</option>
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {entryType === EntryType.Password ? (
          <>
            <div>
              <label htmlFor="appName" className={commonLabelClass}>App/Website Name *</label>
              <input type="text" name="appName" id="appName" value={formData.appName || ''} onChange={handleChange} className={commonInputClass} required placeholder="e.g., Google, Facebook" />
            </div>
            <div>
              <label htmlFor="username" className={commonLabelClass}>Username/Email *</label>
              <input type="text" name="username" id="username" value={formData.username || ''} onChange={handleChange} className={commonInputClass} required placeholder="Your username or email" />
            </div>
            <div>
              <label htmlFor="passwordValue" className={commonLabelClass}>Password *</label>
              <input type="password" name="passwordValue" id="passwordValue" value={formData.passwordValue || ''} onChange={handleChange} className={commonInputClass} required placeholder="Enter a strong password" />
            </div>
            <div>
              <label htmlFor="passwordWebsiteUrl" className={commonLabelClass}>Website URL (Optional)</label>
              <input type="url" name="websiteUrl" id="passwordWebsiteUrl" value={formData.websiteUrl || ''} onChange={handleChange} className={commonInputClass} placeholder="https://example.com" />
            </div>
             <div>
              <label htmlFor="passwordCategory" className={commonLabelClass}>Category (Optional)</label>
              <input type="text" name="category" id="passwordCategory" value={formData.category || ''} onChange={handleChange} className={commonInputClass} placeholder="e.g., Social, Work, Finance" />
            </div>
          </>
        ) : ( // Web3Key fields
          <>
            <div>
              <label htmlFor="label" className={commonLabelClass}>Label / Identifier *</label>
              <input type="text" name="label" id="label" value={formData.label || ''} onChange={handleChange} className={commonInputClass} required placeholder="e.g., My Main ETH Wallet" />
            </div>
            <div>
              <label htmlFor="walletName" className={commonLabelClass}>Wallet Name *</label>
              <input type="text" name="walletName" id="walletName" value={formData.walletName || ''} onChange={handleChange} className={commonInputClass} required placeholder="e.g., MetaMask, Trust Wallet" />
            </div>
            <div>
              <label htmlFor="projectName" className={commonLabelClass}>Project Name (Optional)</label>
              <input type="text" name="projectName" id="projectName" value={formData.projectName || ''} onChange={handleChange} className={commonInputClass} placeholder="e.g., CryptoPunks" />
            </div>
            <div>
              <label htmlFor="secretPhrase" className={commonLabelClass}>Secret Phrase (Optional)</label>
              <textarea name="secretPhrase" id="secretPhrase" value={formData.secretPhrase || ''} onChange={handleChange} className={commonInputClass + " min-h-[80px]"} placeholder="12 or 24-word recovery phrase"></textarea>
            </div>
            <div>
              <label htmlFor="secretKey" className={commonLabelClass}>Secret Key (Optional)</label>
              <input type="password" name="secretKey" id="secretKey" value={formData.secretKey || ''} onChange={handleChange} className={commonInputClass} placeholder="Private key string" />
            </div>
            <div>
              <label htmlFor="pinCode" className={commonLabelClass}>PIN Code (Optional)</label>
              <input type="password" name="pinCode" id="pinCode" value={formData.pinCode || ''} onChange={handleChange} className={commonInputClass} placeholder="e.g., 123456" />
            </div>
             <div>
              <label htmlFor="web3WebsiteUrl" className={commonLabelClass}>Website URL (Optional)</label>
              <input type="url" name="websiteUrl" id="web3WebsiteUrl" value={formData.websiteUrl || ''} onChange={handleChange} className={commonInputClass} placeholder="https://project-website.com" />
            </div>
             <div>
              <label htmlFor="web3Category" className={commonLabelClass}>Category (Optional)</label>
              <input type="text" name="category" id="web3Category" value={formData.category || ''} onChange={handleChange} className={commonInputClass} placeholder="e.g., DeFi, NFT, Gaming" />
            </div>
          </>
        )}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" 
            // Fix: Changed navigate(-1) to navigate(-1, {}) to satisfy expected 2 arguments.
            onClick={() => navigate(-1, {})} 
            className="w-full sm:w-auto flex-grow sm:flex-grow-0 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium rounded-md transition-colors order-2 sm:order-1">
            Cancel
          </button>
          <button type="submit" className="w-full sm:w-auto flex-grow px-6 py-3 bg-brand-purple hover:bg-brand-dark-purple text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2" disabled={isLoading || (isFreeLimitReached && !isEditing)}>
            {isLoading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Entry')}
          </button>
        </div>
      </form>
    </div>
  );
};


export const UpgradeScreen: React.FC = () => {
  const { plan, upgradeToPro } = useAppContext(); // upgradeToPro is async
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const paystackProps: PaystackProps = {
    email: 'user@example.com', 
    amount: PAYMENT_AMOUNT_WEB,
    publicKey: PAYSTACK_PUBLIC_KEY_WEB,
    onSuccess: async () => { // Make onSuccess async
      // The useAppContext for ui.tsx is from root ./types.ts which defines upgradeToPro as: () => void;
      // The async keyword suggests it might be intended to be async, but strictly following types.ts:
      upgradeToPro();
      navigate('/');
    },
    onClose: () => {
      setPaymentError('Payment process was closed. Please try again if you wish to upgrade.');
    },
  };

  if (plan === UserPlan.Pro) {
    return (
      <div className="max-w-md mx-auto text-center bg-slate-800 p-8 rounded-xl shadow-2xl">
        <IconSparkles className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <h1 className="text-3xl font-bold text-slate-100 mb-3">You are already a Pro User!</h1>
        <p className="text-slate-300 mb-6">Enjoy unlimited entries and all premium features.</p>
        <Link to="/" className="px-6 py-3 bg-brand-purple hover:bg-brand-dark-purple text-white font-medium rounded-md transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold text-slate-100 mb-4 text-center">Upgrade to SEEFA Pro</h1>
      <p className="text-slate-300 mb-6 text-center">Unlock unlimited entries and enjoy the full power of SEEFA for just ₦4800 (one-time payment).</p>

      {paymentError && <p className="text-red-400 bg-red-500/20 p-3 rounded-md mb-4 text-sm">{paymentError}</p>}

      <div className="bg-slate-700 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-brand-lavender mb-3">Pro Plan Benefits:</h2>
        <ul className="list-disc list-inside text-slate-200 space-y-1">
          <li>Store unlimited passwords</li>
          <li>Store unlimited Web3 keys</li>
          <li>Priority support (future)</li>
          <li>Early access to new features (future)</li>
        </ul>
      </div>

      {PAYSTACK_PUBLIC_KEY_WEB === 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' ? (
         <div className="bg-yellow-500/20 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-lg mb-6 text-sm">
          <p className="font-semibold">Paystack Developer Mode:</p>
          <p>Please replace the placeholder Paystack public key in <code>ui.tsx</code> with your actual test key to enable payments.</p>
        </div>
      ) : (
        <PaystackButton
          {...paystackProps}
          text="Upgrade to Pro - ₦4800"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-colors text-lg"
        />
      )}

      <button
        // Fix: Changed navigate(-1) to navigate(-1, {}) to satisfy expected 2 arguments.
        onClick={() => navigate(-1, {})}
        className="w-full mt-4 bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium py-3 px-4 rounded-md transition-colors"
      >
        Maybe Later
      </button>
    </div>
  );
};