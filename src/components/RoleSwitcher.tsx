/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile, UserRole } from '../types';
import { Users, Shield, GraduationCap, Briefcase, ChevronDown } from 'lucide-react';

interface RoleSwitcherProps {
  allUsers: UserProfile[];
  currentUser: UserProfile;
  onSwitchUser: (userId: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ allUsers, currentUser, onSwitchUser }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.STUDENT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <GraduationCap className="w-3.5 h-3.5" />
            {role}
          </span>
        );
      case UserRole.FACULTY:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Briefcase className="w-3.5 h-3.5" />
            {role}
          </span>
        );
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Users className="w-3.5 h-3.5" />
            {role}
          </span>
        );
      case UserRole.SUPER_ADMIN:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <Shield className="w-3.5 h-3.5" />
            {role}
          </span>
        );
    }
  };

  return (
    <div className="relative">
      <button
        id="btn-role-switcher"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all text-left"
      >
        <img
          id="img-current-avatar"
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-10 h-10 rounded-lg object-cover border border-slate-100"
        />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {getRoleBadge(currentUser.role)}
          {currentUser.role === UserRole.STUDENT && (
            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md ${
              currentUser.verifiedStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {currentUser.verifiedStatus}
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-3 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2 border-b border-slate-100 mb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">Simulate Identity</h4>
            <p className="text-[11px] text-slate-500">Switch personas to evaluate role-based flows & gatekeeping queues.</p>
          </div>
          <div className="max-h-96 overflow-y-auto px-2 space-y-1">
            {allUsers.map((user) => (
              <button
                id={`btn-user-${user.id}`}
                key={user.id}
                onClick={() => {
                  onSwitchUser(user.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                  user.id === currentUser.id
                    ? 'bg-slate-100 border border-slate-200 font-medium'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                    <span className={`text-[9px] uppercase font-mono px-1 rounded ${
                      user.role === UserRole.STUDENT ? 'text-emerald-700 bg-emerald-50' :
                      user.role === UserRole.FACULTY ? 'text-indigo-700 bg-indigo-50' :
                      user.role === UserRole.ADMIN ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                    }`}>
                      {user.role.split(' ')[0]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.department}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
