import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIssues } from '../contexts/IssueContext';
import IssueCard from '../components/IssueCard';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';
import toast from 'react-hot-toast';
import { Search, Map as MapIcon } from 'lucide-react';

export default function ViewIssues() {
  const { t } = useTranslation();
  const { fetchIssues, issues: allIssues } = useIssues();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [gettingLoc, setGettingLoc] = useState(false);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  useEffect(() => {
    fetchIssues(filters);
  }, [filters]);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setGettingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFilters(f => ({
          ...f,
          nearLat: pos.coords.latitude,
          nearLng: pos.coords.longitude,
          radius: 10 // 10km radius
        }));
        setGettingLoc(false);
      },
      () => {
        toast.error('Location access denied');
        setGettingLoc(false);
      }
    );
  };

  let issues = [...allIssues];
  if (search.trim()) {
    issues = issues.filter(i =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  const totalPages = Math.ceil(issues.length / PER_PAGE);
  const paged = issues.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="page-container" style={{ padding: '90px 0 60px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 className="section-title">{t('issues_title')}</h1>
            <p className="section-subtitle">{t('issues_subtitle')}</p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '500px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text" className="form-input" placeholder="Search issues..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '44px', height: '46px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
               onClick={handleNearMe} disabled={gettingLoc}
               className="btn btn-ghost" style={{ gap: '8px' }}
            >
              <Search size={16} /> {gettingLoc ? 'Locating...' : 'Near Me'}
            </button>
            <div className="glass-card" style={{ display: 'flex', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setViewMode('list')}
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ height: '32px' }}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ height: '32px' }}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        <FilterBar filters={filters} onChange={f => { setFilters(f); setPage(1); }} />

        {viewMode === 'map' ? (
          <div style={{ height: '600px', marginBottom: '30px' }}>
            <MapView issues={issues} height="100%" />
          </div>
        ) : (
          <>
            {paged.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px',
                background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-xl)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ marginBottom: '8px' }}>{t('no_issues')}</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try changing your filters or search term</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, issues.length)} of {issues.length} issues
                  </span>
                </div>
                <div className="grid-3">
                  {paged.map((issue, i) => (
                    <div key={issue.id || issue._id} style={{ animation: `fadeInUp 0.4s ease ${i * 0.06}s both` }}>
                      <IssueCard issue={issue} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm">← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-ghost btn-sm">Next →</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
