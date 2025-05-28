import React, { useState } from 'react';
import { AppDataContextType, Entry, EntryType, PasswordEntry, UserPlan, Web3KeyEntry } from './types';
import { useAppData } from './src/contexts/AppDataContext';
import { ClipboardIcon as IconClipboard, EyeIcon as IconEye, EyeSlashIcon as IconEyeSlash, PencilIcon as IconPencil, TrashIcon as IconTrash, PlusIcon as IconPlus, KeyIcon as IconKey, LockClosedIcon as IconLockClosed, ArrowUpCircleIcon as IconArrowUpCircle, UserCircleIcon as IconUserCircle, GlobeAltIcon as IconGlobeAlt } from '@heroicons/react/24/outline';
import { SparklesIcon as IconSparkles } from '@heroicons/react/24/solid';

// --- Constants for UI ---
const FREE_PLAN_LIMIT_WEB = 5;

interface Web3KeyCardProps {
  entry: Web3KeyEntry;
}

const Web3KeyCard: React.FC<Web3KeyCardProps> = ({ entry }) => {
  const { deleteEntry } = useAppData();
  const [revealed, setRevealed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard!');
    });
  };

  const handleDelete = () => {
    deleteEntry(entry.id);
    setShowDeleteModal(false);
  };

  return (
    <React.Fragment>
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
              <CardActionButton onClick={() => { alert('Edit functionality not implemented yet!'); }} ariaLabel="Edit entry" title="Edit">
                <IconPencil />
              </CardActionButton>
              <CardActionButton onClick={() => setShowDeleteModal(true)} ariaLabel="Delete entry" title="Delete">
                <IconTrash />
              </CardActionButton>
            </div>
          </div>

          <InfoRow label="Address" value={entry.address} onCopy={handleCopy} Icon={IconUserCircle} />
          <InfoRow label="Private Key" value={entry.privateKey} isSensitive revealed={revealed} onCopy={handleCopy} Icon={IconKey} />
          {entry.network && (
            <InfoRow label="Network" value={entry.network} onCopy={handleCopy} truncate Icon={IconGlobeAlt} />
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Web3 Key Entry?"
        message={`Are you sure you want to delete the entry for "${entry.appName}"? This action cannot be undone.`}
        confirmButtonText="Delete"
      />
    </React.Fragment>
  );
};

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
  const { plan, entries, isLoading } = useAppData();

  if (isLoading) { // Don't show plan-dependent UI until plan is loaded
    return (
      <nav className="bg-slate-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-purple-gradient">
              SEEFA
            </div>
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
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-purple-gradient">
            SEEFA
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {plan === UserPlan.Free && (
              <div
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center
                  ${isFreeLimitReached ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-brand-purple hover:bg-brand-dark-purple text-white'}`}
              >
                <IconArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                Upgrade
              </div>
            )}
            {plan === UserPlan.Pro && (
              <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-green-600 text-white flex items-center" title="Pro Plan Active">
                <IconSparkles className="w-4 h-4 mr-1.5 text-yellow-300" />
                PRO
              </span>
            )}
            <div
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium flex items-center"
              title="Add New Entry"
            >
              <IconPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> <span className="hidden sm:inline">New Entry</span><span className="sm:hidden">Add</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const LimitNotice: React.FC = () => {
  const { plan, entries, isLoading } = useAppData();

  if (isLoading || plan === UserPlan.Pro || entries.length < FREE_PLAN_LIMIT_WEB) {
    return null;
  }

  return (
    <div className="bg-yellow-500/20 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-lg mb-6 text-center" role="alert">
      <p className="font-semibold">Free Plan Limit Reached!</p>
      <p className="text-sm">You've saved {entries.length} out of {FREE_PLAN_LIMIT_WEB} allowed entries.</p>
      <div className="mt-2 inline-block bg-brand-purple hover:bg-brand-dark-purple text-white font-bold py-2 px-4 rounded transition-colors text-sm">
        Upgrade to Pro for Unlimited Entries
      </div>
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
