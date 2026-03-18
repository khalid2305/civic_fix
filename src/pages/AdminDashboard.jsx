import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIssues } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Shield, AlertCircle, CheckCircle, Clock, 
  Search, MapPin, ChevronRight, RefreshCw, Trash2, 
  Download, ExternalLink, Inbox, MessageSquare, Star, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'in-progress', 'resolved', 'rejected'];
const statusStyles = {
  'pending': { color: 'var(--color-warning)', bg: 'var(--bg-glass)', shadow: 'rgba(0,0,0,0.1)' },
  'in-progress': { color: 'var(--color-accent)', bg: 'var(--bg-glass)', shadow: 'rgba(0,0,0,0.1)' },
  'resolved': { color: 'var(--text-primary)', bg: 'var(--bg-glass)', shadow: 'rgba(0,0,0,0.1)' },
  'rejected': { color: 'var(--color-danger)', bg: 'var(--bg-glass)', shadow: 'rgba(0,0,0,0.1)' },
  'Pending': { color: 'var(--color-warning)', bg: 'var(--bg-glass)', shadow: 'rgba(0,0,0,0.1)' },
  'In Progress': { color: 'var(--color-accent)', bg: 'var(--bg-glass)', shadow: 'rgba(0,0,0,0.1)' },
  'Resolved': { color: 'var(--text-primary)', bg: 'var(--bg-glass)', shadow: 'rgba(0,0,0,0.1)' },
  'Open': { color: 'var(--text-primary)', bg: 'var(--bg-glass)', shadow: 'rgba(0,0,0,0.1)' }
};

const PIE_COLORS = ['var(--text-primary)', 'var(--text-muted)', 'var(--color-accent)', 'var(--color-primary-dark)', 'var(--color-primary-light)'];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { issues, departments, updateIssueStatus, reassignIssue, deleteIssue, fetchIssues } = useIssues();
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feedback, setFeedback] = useState([]);

  const filteredIssues = useMemo(() => {
    return issues.filter(i => {
      const matchSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDept === 'All' || (i.department?._id || i.department) === selectedDept;
      const matchStatus = statusFilter === 'All' || i.status.toLowerCase() === statusFilter.toLowerCase();
      const matchTab = activeTab === 'triage' ? i.category === 'Other' : true;
      
      return matchSearch && matchDept && matchStatus && matchTab;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [issues, searchTerm, selectedDept, statusFilter, activeTab]);

  const stats = useMemo(() => {
    const total = issues.length;
    const triage = issues.filter(i => i.category === 'Other').length;
    const pending = issues.filter(i => ['pending', 'open'].includes(i.status.toLowerCase())).length;
    const completed = issues.filter(i => i.status.toLowerCase() === 'resolved').length;
    return { total, triage, pending, completed };
  }, [issues]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateIssueStatus(id, status);
      toast.success(`Status: ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const handleReassign = async (id, deptId) => {
    try {
      await reassignIssue(id, deptId);
      toast.success('Reassigned successfully');
    } catch { toast.error('Reassignment failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await deleteIssue(id);
    } catch { toast.error('Delete failed'); }
  };

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('civicfix_token') || user?.token;
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setFeedback(data);
    } catch (e) { console.error('Error fetching feedback:', e); }
  };

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedback();
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    toast.promise(
      Promise.all([fetchIssues(), activeTab === 'feedback' ? fetchFeedback() : Promise.resolve()]),
      { loading: 'Refreshing...', success: 'Data Refreshed', error: 'Refresh Failed' }
    );
  };

  const handleExport = () => {
    const data = activeTab === 'feedback' ? feedback : filteredIssues;
    if (!data.length) return toast.error('No data to export');
    
    let csv = '';
    const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object' && !k.startsWith('_'));
    csv += headers.join(',') + '\n';
    
    data.forEach(row => {
      csv += headers.map(h => {
        let val = row[h] === undefined || row[h] === null ? '' : String(row[h]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civicfix_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="page-container" style={{ padding: '90px 0 60px', background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 50%)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }}>
                <Shield size={22} color="var(--bg-primary)" />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Command Center</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{user?.name}</span>. Managing civic governance efficiently.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
             <button onClick={() => navigate('/admin/feedback')} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <MessageSquare size={16} /> Feedback
             </button>
             <button onClick={handleRefresh} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <RefreshCw size={16} /> Refresh
             </button>
             <button onClick={handleExport} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Download size={16} /> Export Data
             </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {[
            { label: 'Total Complaints', value: stats.total, icon: <Inbox size={20} />, color: 'var(--text-primary)' },
            { label: 'Action Required (Other)', value: stats.triage, icon: <AlertCircle size={20} />, color: 'var(--color-danger)', highlight: stats.triage > 0 },
            { label: 'Pending Review', value: stats.pending, icon: <Clock size={20} />, color: 'var(--color-warning)' },
            { label: 'Resolved Tickets', value: stats.completed, icon: <CheckCircle size={20} />, color: 'var(--text-primary)' },
          ].map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', border: s.highlight ? '1px solid var(--color-danger)' : '1px solid var(--border-glass)' }}>
              {s.highlight && <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: 'var(--color-danger)' }} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ color: s.color, background: `${s.color}15`, padding: '10px', borderRadius: '12px' }}>{s.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{s.value}</div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          <div className="glass-card" style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'all', label: 'All Complaints', icon: <Inbox size={14} /> },
                { id: 'triage', label: 'Triage (Others)', icon: <AlertCircle size={14} />, alert: stats.triage > 0 },
                { id: 'stats', label: 'Analytics', icon: <TrendingUp size={14} /> },
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ gap: '8px', position: 'relative' }}
                >
                  {t.icon} {t.label}
                  {t.alert && <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--color-danger)', borderRadius: '50%', border: '2px solid var(--bg-primary)' }} />}
                </button>
              ))}
            </div>

            {activeTab !== 'stats' && (
              <div style={{ display: 'flex', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                <div style={{ position: 'relative', width: '250px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" placeholder="Quick search..." 
                    className="form-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '34px', height: '36px', fontSize: '0.85rem' }} 
                  />
                </div>
                <select className="form-input" value={selectedDept} onChange={e => setSelectedDept(e.target.value)} style={{ minWidth: '180px', padding: '6px 10px', height: 'auto', fontSize: '0.85rem' }}>
                  <option value="All">All Departments</option>
                  {departments.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>)}
                </select>
                <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ minWidth: '140px', padding: '6px 10px', height: 'auto', fontSize: '0.85rem' }}>
                  <option value="All">All Status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
            )}
          </div>

          {activeTab === 'stats' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
               <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem' }}>Resolution Trends</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departments.map(d => ({
                        name: d.short,
                        total: issues.filter(i => (i.department?._id || i.department) === (d._id || d.id)).length,
                        resolved: issues.filter(i => (i.department?._id || i.department) === (d._id || d.id) && i.status.toLowerCase() === 'resolved').length,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
                        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} />
                        <YAxis tick={{ fill: 'var(--text-muted)' }} />
                        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                        <Bar dataKey="total" fill="var(--text-muted)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" fill="var(--text-primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem' }}>Category Distribution</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(issues.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {}))
                            .map(([name, value]) => ({ name, value }))}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}
                        >
                          {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          ) : (
            <div className="glass-card" style={{ overflow: 'hidden', border: 'none' }}>
              <div className="table-responsive">
                <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{ background: 'transparent' }}>
                      <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complaint Details</th>
                      <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Department</th>
                      <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reported By</th>
                      <th style={{ padding: '12px 20px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) => {
                      const ss = statusStyles[issue.status] || statusStyles['pending'];
                      return (
                        <tr key={issue._id || issue.id} className="table-row-hover" style={{ background: 'var(--bg-glass)', borderRadius: '12px' }}>
                          <td style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={issue.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{issue.title}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>{issue.category}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Clock size={12} /> {new Date(issue.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '20px' }}>
                            <select value={issue.department?._id || issue.department} onChange={(e) => handleReassign(issue._id || issue.id, e.target.value)} className="form-input" style={{ padding: '6px 10px', height: 'auto', fontSize: '0.8rem', width: '100%', minWidth: '180px' }}>
                              {departments.map(d => <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '20px' }}>
                            <select value={issue.status.toLowerCase()} onChange={(e) => handleStatusChange(issue._id || issue.id, e.target.value)} className="form-input" style={{ padding: '6px 10px', height: 'auto', fontSize: '0.8rem', width: '100%', minWidth: '130px', fontWeight: 700, color: ss.color, backgroundColor: ss.bg, border: `1px solid ${ss.color}30` }}>
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '20px' }}>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{issue.createdBy?.name || 'Anonymous'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ID: {(issue._id || issue.id).substring(0, 8)}</div>
                          </td>
                          <td style={{ padding: '20px', textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                               <button onClick={() => navigate(`/issues/${issue.id || issue._id}`)} className="btn btn-ghost btn-xs" title="View Details"><ExternalLink size={14} /></button>
                               <button onClick={() => handleDelete(issue._id || issue.id)} className="btn btn-ghost btn-xs" style={{ color: 'var(--color-danger)' }} title="Delete Permanent"><Trash2 size={14} /></button>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
