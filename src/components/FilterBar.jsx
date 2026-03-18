import { useTranslation } from 'react-i18next';
import { useIssues } from '../contexts/IssueContext';
import { categories } from '../data/mockData';
import { SlidersHorizontal } from 'lucide-react';

export default function FilterBar({ filters, onChange }) {
  const { t } = useTranslation();
  const { departments } = useIssues();

  const handle = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.85rem' }}>
        <SlidersHorizontal size={16} /> Filters
      </div>

      <select
        className="filter-select"
        value={filters.category || 'All'}
        onChange={e => handle('category', e.target.value)}
      >
        <option value="All">{t('filter_all')} {t('filter_category')}</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        className="filter-select"
        value={filters.department || 'All'}
        onChange={e => handle('department', e.target.value)}
      >
        <option value="All">{t('filter_all')} {t('filter_department')}</option>
        {departments.map(d => <option key={d._id} value={d._id}>{d.short || d.name}</option>)}
      </select>

      <select
        className="filter-select"
        value={filters.status || 'All'}
        onChange={e => handle('status', e.target.value)}
      >
        <option value="All">{t('filter_all')} {t('filter_status')}</option>
        <option value="Pending">{t('status_pending')}</option>
        <option value="Open">{t('status_open')}</option>
        <option value="In Progress">{t('status_progress')}</option>
        <option value="Resolved">{t('status_resolved')}</option>
      </select>

      <select
        className="filter-select"
        value={filters.sort || 'newest'}
        onChange={e => handle('sort', e.target.value)}
      >
        <option value="newest">{t('sort_newest')}</option>
        <option value="popular">{t('sort_popular')}</option>
        <option value="oldest">{t('sort_oldest')}</option>
      </select>

      {(filters.category !== 'All' || filters.department !== 'All' || filters.status !== 'All') && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange({ category: 'All', department: 'All', status: 'All', sort: 'newest' })}
          style={{ color: 'var(--color-danger)' }}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}
