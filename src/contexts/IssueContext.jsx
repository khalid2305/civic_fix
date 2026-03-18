import { createContext, useContext, useState, useEffect } from 'react';

const IssueContext = createContext();

export const useIssues = () => useContext(IssueContext);

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);

  const normalizeImageUrl = (url) => {
    if (!url) return 'https://placehold.co/600x400/1e293b/a8b2d1?text=No+Image+Available';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `http://localhost:5000/uploads/${url}`;
  };

  useEffect(() => {
    fetchIssues();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/issues/departments');
      const data = await response.json();
      if (response.ok) setDepartments(data);
    } catch (err) { console.error('Dept fetch error:', err); }
  };

  const fetchIssues = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`http://localhost:5000/api/issues?${query}`);
    const data = await response.json();
    if (response.ok) {
      setIssues(data.map(i => ({ 
        ...i, 
        id: i._id,
        imageUrl: normalizeImageUrl(i.imageUrl)
      }))); // Normalize ID and Image
    }
  };

  const supportIssue = async (issueId) => {
    const token = localStorage.getItem('civicfix_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/issues/${issueId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const updatedIssue = await response.json();
        const normalized = { ...updatedIssue, id: updatedIssue._id, imageUrl: normalizeImageUrl(updatedIssue.imageUrl) };
        setIssues(prev => prev.map(i => (i._id === issueId || i.id === issueId) ? normalized : i));
        return normalized;
      }
    } catch (err) { console.error('Support error:', err); }
  };

  const addComment = async (issueId, text) => {
    const token = localStorage.getItem('civicfix_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const newComment = await response.json();
        setIssues(prev => prev.map(issue => {
          if (issue._id !== issueId && issue.id !== issueId) return issue;
          return { ...issue, comments: [newComment, ...(issue.comments || [])] };
        }));
        return newComment;
      }
    } catch (err) { console.error('Comment error:', err); }
  };

  const addIssue = async (issueData) => {
    const token = localStorage.getItem('civicfix_token');
    
    // Check if issueData is FormData or a plain object
    let body = issueData;
    let headers = { 'Authorization': `Bearer ${token}` };
    
    if (!(issueData instanceof FormData)) {
      body = JSON.stringify(issueData);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch('http://localhost:5000/api/issues', {
      method: 'POST',
      headers,
      body
    });

    const data = await response.json();
    if (response.ok) {
      const issue = { ...data, id: data._id, imageUrl: normalizeImageUrl(data.imageUrl) };
      setIssues(prev => [issue, ...prev]);
      return issue;
    } else {
      throw new Error(data.message || 'Failed to create issue');
    }
  };

  const updateIssueStatus = async (issueId, status) => {
    const token = localStorage.getItem('civicfix_token');
    const response = await fetch(`http://localhost:5000/api/admin/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      const updatedIssue = await response.json();
      const normalized = { ...updatedIssue, id: updatedIssue._id, imageUrl: normalizeImageUrl(updatedIssue.imageUrl) };
      setIssues(prev => prev.map(i => (i._id === issueId || i.id === issueId) ? normalized : i));
    }
  };

  const getIssueById = (id) => issues.find(i => i.id === id || i._id === id);

  const getTrendingIssues = (limit = 6) =>
    [...issues].sort((a, b) => b.supportCount - a.supportCount).slice(0, limit);

  const getIssuesByUser = (userId) => issues.filter(i => (i.createdBy?._id || i.createdBy) === userId);

  const getFilteredIssues = (filters) => {
    fetchIssues(filters);
    return issues;
  };

  const fetchIssueById = async (id) => {
    const response = await fetch(`http://localhost:5000/api/issues/${id}`);
    const data = await response.json();
    if (response.ok) {
      const issue = { ...data, id: data._id, imageUrl: normalizeImageUrl(data.imageUrl) };
      setIssues(prev => {
        const exists = prev.find(i => i._id === id);
        if (exists) return prev.map(i => i._id === id ? issue : i);
        return [...prev, issue];
      });
      return issue;
    }
    throw new Error(data.message || 'Failed to fetch issue');
  };

  const fetchComments = async (issueId) => {
    const response = await fetch(`http://localhost:5000/api/issues/${issueId}/comments`);
    const data = await response.json();
    if (response.ok) {
      setIssues(prev => prev.map(i => i._id === issueId ? { ...i, comments: data } : i));
      return data;
    }
    return [];
  };

  const deleteIssue = async (issueId) => {
    const token = localStorage.getItem('civicfix_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/issues/${issueId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setIssues(prev => prev.filter(i => i._id !== issueId && i.id !== issueId));
        toast.success('Issue deleted');
        return true;
      }
    } catch (err) { console.error('Delete error:', err); }
    return false;
  };

  const reassignIssue = async (issueId, departmentId) => {
    const token = localStorage.getItem('civicfix_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/issues/${issueId}/reassign`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ departmentId })
      });

      if (response.ok) {
        const updatedIssue = await response.json();
        const normalized = { ...updatedIssue, id: updatedIssue._id, imageUrl: normalizeImageUrl(updatedIssue.imageUrl) };
        setIssues(prev => prev.map(i => (i._id === issueId || i.id === issueId) ? normalized : i));
        return normalized;
      }
    } catch (err) { console.error('Reassign error:', err); }
  };

  return (
    <IssueContext.Provider value={{
      issues, departments, supportIssue, addComment, addIssue,
      updateIssueStatus, reassignIssue, deleteIssue, getIssueById, getTrendingIssues,
      getIssuesByUser, getFilteredIssues, fetchIssues,
      fetchIssueById, fetchComments, fetchDepartments
    }}>
      {children}
    </IssueContext.Provider>
  );
}
