'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Lock,
  UserCheck,
  Mail,
  Phone,
  Building,
  KeyRound,
  Check,
} from '../../components/HeroIconsHub';

import { getERPUsers, saveERPUsers, ERPUser } from '../../lib/erpAuth';
import { showToast } from '../../lib/toastStore';
import { addAuditLog } from '../../lib/auditLogger';

export interface Employee extends ERPUser {}

export interface ERPPermission {
  id: string;
  module: string;
  label: string;
}

export interface ERPRole {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  permissions: string[]; // List of permission IDs
  employeeCount?: number;
}

const ALL_PERMISSIONS: ERPPermission[] = [
  { id: 'perm-products-view', module: 'Məhsullar', label: 'Məhsullara Baxış' },
  { id: 'perm-products-edit', module: 'Məhsullar', label: 'Məhsul Əlavə Et / Redaktə' },
  { id: 'perm-orders-view', module: 'Sifarişlər', label: 'Sifarişlərə Baxış' },
  { id: 'perm-orders-edit', module: 'Sifarişlər', label: 'Sifariş Statusunu Dəyişdir' },
  { id: 'perm-customers-view', module: 'Müştərilər', label: 'Müştərilərə & CRM-ə Baxış' },
  { id: 'perm-customers-block', module: 'Müştərilər', label: 'Müştəri Hesablarını Blokla' },
  { id: 'perm-analytics-view', module: 'Analitika', label: 'Maliyyə Və Satış Analitikası' },
  { id: 'perm-marketing-edit', module: 'Marketinq', label: 'Banners Və Kampaniyaları İdarə Et' },
  { id: 'perm-stores-edit', module: 'Mağazalar', label: 'Filial Və İş Saatlarını Dəyişdir' },
  { id: 'perm-settings-edit', module: 'Sistem Ayarları', label: 'ERP Və Veb Sayt Ayarları' },
  { id: 'perm-employees-edit', module: 'Əməkdaşlar', label: 'Əməkdaşlar Və Rolların İdarə Edilməsi' },
];

const INITIAL_ROLES: ERPRole[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Bütün ERP modullarına Və sistem parametrlərinə tam 100% giriş hüququ.',
    badgeColor: 'bg-[#4f533b] text-white border-[#4f533b]',
    permissions: ALL_PERMISSIONS.map(p => p.id),
  },
  {
    id: 'role-store-manager',
    name: 'Mağaza Meneceri',
    description: 'Məhsullar, sifarişlər, müştərilər Və filial stoklarını idarə etmək hüququ.',
    badgeColor: 'bg-emerald-600 text-white border-emerald-600',
    permissions: ['perm-products-view', 'perm-products-edit', 'perm-orders-view', 'perm-orders-edit', 'perm-customers-view', 'perm-stores-edit'],
  },
  {
    id: 'role-cashier',
    name: 'Kassir & Satıcı',
    description: 'Yalnız kassa satışı Və daxil olan sifarişlərin qəbul edilməsi hüququ.',
    badgeColor: 'bg-amber-600 text-white border-amber-600',
    permissions: ['perm-products-view', 'perm-products-edit', 'perm-orders-view'],
  },
  {
    id: 'role-warehouse',
    name: 'Anbardar (Stok Menecer)',
    description: 'Anbar stokuna baxış, sayım Və məhsul qalıqlarını yeniləmək hüququ.',
    badgeColor: 'bg-amber-600 text-white border-amber-600',
    permissions: ['perm-products-view', 'perm-products-edit', 'perm-orders-view'],
  },
  {
    id: 'role-content',
    name: 'Kontent Və SEO Menecer',
    description: 'Banners, kampaniyalar, sayt ayarları Və SEO mətnlərini idarə etmək hüququ.',
    badgeColor: 'bg-purple-600 text-white border-purple-600',
    permissions: ['perm-products-view', 'perm-products-edit', 'perm-marketing-edit', 'perm-settings-edit'],
  },
];

export default function EmployeesAndRolesPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'roles'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<ERPRole[]>(INITIAL_ROLES);
  const [searchQuery, setSearchQuery] = useState('');

  // Employee Modal State
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [formEmpName, setFormEmpName] = useState('');
  const [formEmpUsername, setFormEmpUsername] = useState('');
  const [formEmpEmail, setFormEmpEmail] = useState('');
  const [formEmpPhone, setFormEmpPhone] = useState('');
  const [formEmpRoleId, setFormEmpRoleId] = useState('role-store-manager');
  const [formEmpDept, setFormEmpDept] = useState('Satış Şöbəsi');
  const [formEmpStatus, setFormEmpStatus] = useState<'active' | 'leave' | 'inactive'>('active');
  const [formEmpPassword, setFormEmpPassword] = useState('Admin123!');
  const [formEmp2FASecret, setFormEmp2FASecret] = useState('HXDMVJECJJWSRB3HWIZR4IFUGFTT42K2');

  const generateNew2FASecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    // Generate 32-char Base32 key (160-bit) — RFC 4226 / Google Authenticator standard
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormEmp2FASecret(secret);
    showToast('Yeni 32 simvolluk Google Authenticator açarı yaratıldı!', 'info');
  };

  // Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ERPRole | null>(null);
  const [formRoleName, setFormRoleName] = useState('');
  const [formRoleDesc, setFormRoleDesc] = useState('');
  const [formRoleColor, setFormRoleColor] = useState('bg-emerald-600 text-white border-emerald-600');
  const [formRolePerms, setFormRolePerms] = useState<string[]>([]);

  useEffect(() => {
    try {
      const users = getERPUsers();
      setEmployees(users as Employee[]);

      const savedRoles = localStorage.getItem('technomania_erp_roles');
      if (savedRoles) {
        setRoles(JSON.parse(savedRoles));
      }
    } catch (e) {}
  }, []);

  const saveEmployees = (updated: Employee[]) => {
    setEmployees(updated);
    saveERPUsers(updated);
  };

  const saveRoles = (updated: ERPRole[]) => {
    setRoles(updated);
    try {
      localStorage.setItem('technomania_erp_roles', JSON.stringify(updated));
    } catch (e) {}
  };

  // Open Create/Edit Employee Modal
  const handleOpenEmpModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmp(emp);
      setFormEmpName(emp.name);
      setFormEmpUsername(emp.username || emp.email.split('@')[0]);
      setFormEmpEmail(emp.email);
      setFormEmpPhone(emp.phone);
      setFormEmpRoleId(emp.roleId);
      setFormEmpDept(emp.department);
      setFormEmpStatus(emp.status);
      setFormEmpPassword(emp.passwordHash || 'SuperAdmin2026!');
      setFormEmp2FASecret(emp.twoFactorSecret || 'HXDMVJECJJWSRB3HWIZR4IFUGFTT42K2');
    } else {
      setEditingEmp(null);
      setFormEmpName('');
      setFormEmpUsername('');
      setFormEmpEmail('');
      setFormEmpPhone('');
      setFormEmpRoleId(roles[0]?.id || 'role-store-manager');
      setFormEmpDept('Satış Şöbəsi');
      setFormEmpStatus('active');
      setFormEmpPassword('Admin123!');
      setFormEmp2FASecret('HXDMVJECJJWSRB3HWIZR4IFUGFTT42K2');
    }
    setIsEmpModalOpen(true);
  };

  // Save Employee
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpName.trim() || !formEmpEmail.trim()) return;

    const roleObj = roles.find(r => r.id === formEmpRoleId);
    const roleName = roleObj ? roleObj.name : 'Əməkdaş';
    const cleanUsername = (formEmpUsername.trim() || formEmpEmail.split('@')[0]).toLowerCase();

    let updated: Employee[];
    if (editingEmp) {
      updated = employees.map(emp => emp.id === editingEmp.id ? {
        ...emp,
        name: formEmpName.trim(),
        username: cleanUsername,
        email: formEmpEmail.trim(),
        phone: formEmpPhone.trim(),
        roleId: formEmpRoleId,
        roleName: roleName,
        department: formEmpDept.trim(),
        status: formEmpStatus,
        passwordHash: formEmpPassword,
        twoFactorSecret: formEmp2FASecret,
      } : emp);
      showToast(`Əməkdaş "${formEmpName}" məlumatları (Username & 2FA) yeniləndi`, 'info');
      addAuditLog('employee_update', 'employee', `Əməkdaş ${cleanUsername} (${roleName}) məlumatları və 2FA açarı daxildən yeniləndi`, {
        entityId: editingEmp?.id,
        entityName: formEmpName.trim(),
        oldValues: { username: editingEmp?.username, role: editingEmp?.roleName, status: editingEmp?.status },
        newValues: { username: cleanUsername, role: roleName, department: formEmpDept.trim(), status: formEmpStatus },
      });
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name: formEmpName.trim(),
        username: cleanUsername,
        email: formEmpEmail.trim(),
        phone: formEmpPhone.trim(),
        roleId: formEmpRoleId,
        roleName: roleName,
        department: formEmpDept.trim(),
        status: formEmpStatus,
        passwordHash: formEmpPassword,
        twoFactorSecret: formEmp2FASecret,
        twoFactorEnabled: true,
        joinedDate: new Date().toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      updated = [newEmp, ...employees];
      showToast(`Yeni əməkdaş "${formEmpName}" (${cleanUsername}) əlavə edildi!`, 'success');
      addAuditLog('employee_add', 'employee', `Yeni ERP istifadəçisi ${cleanUsername} (${roleName}) yaradıldı`, {
        entityId: newEmp.id,
        entityName: newEmp.name,
        newValues: { username: cleanUsername, role: roleName, department: newEmp.department, status: newEmp.status },
      });
    }

    saveEmployees(updated);
    setIsEmpModalOpen(false);
  };

  // Delete Employee
  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`"${name}" əməkdaşını silmək istədiyinizdən əminsiniz?`)) {
      const target = employees.find(e => e.id === id);
      const updated = employees.filter(e => e.id !== id);
      saveEmployees(updated);
      showToast(`Əməkdaş "${name}" sistemdən silindi`, 'error');
      addAuditLog('employee_delete', 'employee', `Əməkdaş ${name} (${target?.username || id}) bazadan silindi`, {
        entityId: id,
        entityName: name,
        oldValues: { username: target?.username, role: target?.roleName, email: target?.email },
      });
    }
  };

  // Open Role Modal
  const handleOpenRoleModal = (role?: ERPRole) => {
    if (role) {
      setEditingRole(role);
      setFormRoleName(role.name);
      setFormRoleDesc(role.description);
      setFormRoleColor(role.badgeColor);
      setFormRolePerms([...role.permissions]);
    } else {
      setEditingRole(null);
      setFormRoleName('');
      setFormRoleDesc('');
      setFormRoleColor('bg-[#4f533b] text-white border-[#4f533b]');
      setFormRolePerms(['perm-products-view', 'perm-orders-view']);
    }
    setIsRoleModalOpen(true);
  };

  // Save Role
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim()) return;

    let updated: ERPRole[];
    if (editingRole) {
      updated = roles.map(r => r.id === editingRole.id ? {
        ...r,
        name: formRoleName.trim(),
        description: formRoleDesc.trim(),
        badgeColor: formRoleColor,
        permissions: formRolePerms,
      } : r);
    } else {
      const newRole: ERPRole = {
        id: `role-${Date.now()}`,
        name: formRoleName.trim(),
        description: formRoleDesc.trim(),
        badgeColor: formRoleColor,
        permissions: formRolePerms,
      };
      updated = [...roles, newRole];
    }

    saveRoles(updated);
    setIsRoleModalOpen(false);
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const q = searchQuery.toLowerCase().trim();
    return emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.roleName.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl text-slate-700">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#4f533b]" /> Əməkdaşlar və rolların idarə edilməsi
          </h1>
          <p className="text-sm text-slate-500">
            ERP panelinə daxil olan işçiləri, giriş icazələrini və rollara görə hüquqları mərkəzləşdirilmiş idarə edin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'employees' ? (
            <button
              onClick={() => handleOpenEmpModal()}
              className="px-4 py-2 bg-[#4f533b] hover:bg-[#3e4230] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Yeni əməkdaş əlavə et
            </button>
          ) : (
            <button
              onClick={() => handleOpenRoleModal()}
              className="px-4 py-2 bg-[#4f533b] hover:bg-[#3e4230] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Yeni rol yarat
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'employees'
              ? 'border-[#4f533b] text-[#4f533b]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Əməkdaşlar siyahısı ({employees.length})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'roles'
              ? 'border-[#4f533b] text-[#4f533b]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" /> ERP Rolları Və İcazələr ({roles.length})
        </button>
      </div>

      {/* ── TAB 1: EMPLOYEES LIST ── */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ad, e-poçt, rol və ya şöbə..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold tracking-wider">
                  <th className="py-3.5 px-4">Əməkdaş</th>
                  <th className="py-3.5 px-4">Əlaqə Nömrəsi</th>
                  <th className="py-3.5 px-4">Rol Və Şöbə</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Qoşulma Tarixi</th>
                  <th className="py-3.5 px-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f4f5f0] text-[#4f533b] font-black text-xs flex items-center justify-center border border-[#4f533b]/20 flex-shrink-0">
                          {emp.name[0]}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                            {emp.name}
                            <span className="text-[10px] font-mono text-[#4f533b] bg-[#f4f5f0] px-1.5 py-0.2 rounded border border-[#4f533b]/20">
                              @{emp.username || emp.email.split('@')[0]}
                            </span>
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{emp.email}</span>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-200">
                              2FA: {emp.twoFactorSecret || 'HXDMVJECJJWSRB3HWIZR4IFUGFTT42K2'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{emp.phone}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2 py-0.5 rounded text-[11px] font-extrabold inline-block">
                          {emp.roleName}
                        </span>
                        <span className="text-[11px] text-slate-500 block">{emp.department}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : emp.status === 'leave'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          emp.status === 'active' ? 'bg-emerald-500' : emp.status === 'leave' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {emp.status === 'active' ? 'İşdədir (Aktiv)' : emp.status === 'leave' ? 'Məzuniyyətdə' : 'Deaktiv'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {emp.joinedDate}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEmpModal(emp)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#f4f5f0] hover:text-[#4f533b] transition cursor-pointer"
                          title="Redaktə Et"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: ROLES & PERMISSIONS ── */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-black border ${role.badgeColor}`}>
                    {role.name}
                  </span>
                  <p className="text-xs text-slate-500 pt-1">{role.description}</p>
                </div>

                <button
                  onClick={() => handleOpenRoleModal(role)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#f4f5f0] hover:text-[#4f533b] transition cursor-pointer"
                  title="Rolu Və İcazələri Redaktə Et"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Permissions Checklist Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider block">
                  Təyin Olunmuş ERP Hüquqları ({role.permissions.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_PERMISSIONS.map(perm => {
                    const isGranted = role.permissions.includes(perm.id);
                    return (
                      <span
                        key={perm.id}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-bold flex items-center gap-1 ${
                          isGranted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60 line-through'
                        }`}
                      >
                        {isGranted ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-300" />}
                        {perm.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE / EDIT EMPLOYEE MODAL ── */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingEmp ? 'Əməkdaş Məlumatlarını Redaktə Et' : 'Yeni Əməkdaş Əlavə Et'}
              </h3>
              <button
                onClick={() => setIsEmpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Ad Və Soyad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: İlkin Rzayev"
                    value={formEmpName}
                    onChange={e => setFormEmpName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 mb-1 block">İstifadəçi Adı (Username) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: ilkinrzayev"
                    value={formEmpUsername}
                    onChange={e => setFormEmpUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">E-poçt Ünvanı *</label>
                  <input
                    type="email"
                    required
                    placeholder="ilkinrzayev@technomania.az"
                    value={formEmpEmail}
                    onChange={e => setFormEmpEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 mb-1 block">ERP Giriş Şifrəsi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rzyv455446"
                    value={formEmpPassword}
                    onChange={e => setFormEmpPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b] font-mono"
                  />
                </div>
              </div>

              {/* Google Authenticator 2FA Secret Key + QR Code */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#4f533b]" /> Google Authenticator 2FA
                  </label>
                  <button
                    type="button"
                    onClick={generateNew2FASecret}
                    className="text-[10px] text-[#4f533b] font-bold underline cursor-pointer hover:text-[#3e4230]"
                  >
                    + Yeni Açar Generasiya Et
                  </button>
                </div>

                {/* QR Code + Secret side by side */}
                <div className="flex items-start gap-3">
                  {/* QR Code image via api.qrserver.com */}
                  {formEmp2FASecret && (
                    <div className="flex-shrink-0 p-1.5 bg-white border border-slate-200 rounded-xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&margin=2&data=${encodeURIComponent(
                          `otpauth://totp/TechnoERP:${formEmpUsername || formEmpEmail || 'user'}?secret=${formEmp2FASecret}&issuer=TechnoERP`
                        )}`}
                        alt="Google Authenticator QR Kodu"
                        width={96}
                        height={96}
                        className="rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Google Authenticator-da <strong>+ → QR kodu skan et</strong> seçin və ya açarı əl ilə daxil edin:
                    </p>
                    <input
                      type="text"
                      required
                      value={formEmp2FASecret}
                      onChange={e => setFormEmp2FASecret(e.target.value.toUpperCase().replace(/[^A-Z2-7]/g, ''))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[11px] text-[#4f533b] font-mono font-bold tracking-wider outline-none focus:border-[#4f533b]"
                      placeholder="HXDMVJECJJWSRB3HWIZR4IFUGFTT42K2"
                    />
                    <p className="text-[10px] text-slate-400">32 simvol, yalnız A-Z, 2-7</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Telefon Nömrəsi</label>
                <input
                  type="text"
                  placeholder="+994 50 000 00 00"
                  value={formEmpPhone}
                  onChange={e => setFormEmpPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Təyin Olunan Rol *</label>
                  <select
                    value={formEmpRoleId}
                    onChange={e => setFormEmpRoleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#4f533b]"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-600 mb-1 block">İş Statusu</label>
                  <select
                    value={formEmpStatus}
                    onChange={e => setFormEmpStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#4f533b]"
                  >
                    <option value="active">İşdədir (Aktiv)</option>
                    <option value="leave">Məzuniyyətdə</option>
                    <option value="inactive">Deaktiv</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Şöbə / Filial</label>
                <input
                  type="text"
                  placeholder="Məs: Satış Şöbəsi (Nərimanov)"
                  value={formEmpDept}
                  onChange={e => setFormEmpDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4f533b] hover:bg-[#3e4230] shadow-xs cursor-pointer"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT ROLE MODAL ── */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingRole ? 'Rolu Və İcazələri Redaktə Et' : 'Yeni Rol Yarat'}
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Rolun Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Mağaza Meneceri"
                  value={formRoleName}
                  onChange={e => setFormRoleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Təsviri</label>
                <input
                  type="text"
                  placeholder="Bu rolun əsas öhdəlikləri..."
                  value={formRoleDesc}
                  onChange={e => setFormRoleDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 mb-2 block">
                  İcazələr Siyahısı (Seçilmiş Modullara Giriş):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {ALL_PERMISSIONS.map(perm => {
                    const isChecked = formRolePerms.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        onClick={() => {
                          if (isChecked) {
                            setFormRolePerms(formRolePerms.filter(id => id !== perm.id));
                          } else {
                            setFormRolePerms([...formRolePerms, perm.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                          isChecked ? 'bg-[#f4f5f0] text-[#4f533b] border-[#4f533b]/40 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span>{perm.label}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-[#4f533b] text-white border-[#4f533b]' : 'bg-white border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4f533b] hover:bg-[#3e4230] shadow-xs cursor-pointer"
                >
                  Rolu Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
