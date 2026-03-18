// Application Constants and Configuration

export const departments = [
  { id: 'pwd', name: 'Public Works Department', short: 'PWD', color: '#3b82f6' },
  { id: 'water', name: 'Water Supply Board', short: 'WSB', color: '#06b6d4' },
  { id: 'electricity', name: 'Electricity Board', short: 'EB', color: '#f59e0b' },
  { id: 'sanitation', name: 'Sanitation Department', short: 'SD', color: '#10b981' },
  { id: 'parks', name: 'Parks & Recreation', short: 'PR', color: '#8b5cf6' },
  { id: 'traffic', name: 'Traffic Police', short: 'TP', color: '#ef4444' },
];

export const categoryDeptMap = {
  'Roads & Potholes': 'pwd',
  'Water Supply': 'water',
  'Electricity': 'electricity',
  'Garbage & Sanitation': 'sanitation',
  'Parks & Recreation': 'parks',
  'Street Lights': 'electricity',
  'Drainage': 'pwd',
  'Other': 'pwd',
};

export const categories = Object.keys(categoryDeptMap);

export const monthlyTrends = [
  { month: 'Oct', issues: 45, resolved: 30 },
  { month: 'Nov', issues: 62, resolved: 48 },
  { month: 'Dec', issues: 78, resolved: 55 },
  { month: 'Jan', issues: 95, resolved: 72 },
  { month: 'Feb', issues: 110, resolved: 89 },
  { month: 'Mar', issues: 135, resolved: 98 },
];

export const getDepartmentById = (id) => departments.find(d => d.id === id);
export const getDepartmentForCategory = (category) => {
  const deptId = categoryDeptMap[category];
  return departments.find(d => d.id === deptId);
};
