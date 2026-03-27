import { useState, useEffect, useContext } from 'react';
import { AuthContext, api } from '../AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'ACCOUNTS' | 'LOGS'>('ACCOUNTS');

  // Accounts State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  // Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (activeTab === 'ACCOUNTS') {
      fetchAccounts();
    } else {
      fetchLogs();
    }
  }, [activeTab, filter]);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/admin/accounts');
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/admin/logs?category=${filter}`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    try {
      await api.delete(`/admin/accounts/${id}`);
      setAccounts(accounts.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Insertion Sort Function to satisfy the requirement
  const insertionSortNewAdd = (arr: any[], newAcc: any) => {
    let newArr = [...arr, newAcc];
    for (let i = 1; i < newArr.length; i++) {
        let current = newArr[i];
        let j = i - 1;
        while (j >= 0 && newArr[j].fullName.toLowerCase() > current.fullName.toLowerCase()) {
            newArr[j + 1] = newArr[j];
            j--;
        }
        newArr[j + 1] = current;
    }
    return newArr;
  };

  const handleAddDemoAccount = async () => {
    const demouser = {
      fullName: 'Demo User ' + Math.floor(Math.random() * 1000),
      course: 'BTech',
      studentId: '12345',
      collegeEmail: `demo${Math.floor(Math.random()*100)}@geu.ac.in`,
      personalEmail: 'demo@gmail.com',
      password: 'password123',
      role: 'USER'
    };
    try {
      const res = await api.post('/admin/accounts', demouser);
      // applying insertion sort when new element added
      setAccounts(insertionSortNewAdd(accounts, res.data));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAccounts = Array.isArray(accounts) ? accounts.filter(acc => 
    (acc?.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
    (acc?.collegeEmail || '').toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="logo" style={{ margin: 0 }}><span className="logo-geu">GEU</span> <span className="logo-findnet">FindNet</span> Admin</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>Admin Portal</span>
          <button onClick={logout} className="danger">Logout</button>
        </div>
      </div>

      <div className="glass-panel">
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--border-glass)' }}>
          <div 
             onClick={() => setActiveTab('ACCOUNTS')} 
             style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'ACCOUNTS' ? '2px solid var(--accent-color)' : 'transparent' }}
          >Accounts</div>
          <div 
             onClick={() => setActiveTab('LOGS')} 
             style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'LOGS' ? '2px solid var(--accent-color)' : 'transparent' }}
          >Logs</div>
        </div>

        {activeTab === 'ACCOUNTS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Search accounts..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ width: '300px' }} 
              />
              <button className="primary" onClick={handleAddDemoAccount}>Add Random Account</button>
            </div>
            
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredAccounts) && filteredAccounts.map(acc => (
                  <tr key={acc?.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '10px' }}>{acc?.id}</td>
                    <td>{acc?.fullName}</td>
                    <td>{acc?.collegeEmail}</td>
                    <td><span style={{ padding: '2px 8px', borderRadius: '4px', background: acc?.role==='ADMIN'?'var(--danger)':'var(--accent-color)' }}>{acc?.role}</span></td>
                    <td>
                      <button onClick={() => handleDeleteAccount(acc?.id)} className="danger" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginRight: '10px' }}>Filter: </label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '200px' }}>
                <option value="ALL">All activities</option>
                <option value="LOST">Lost</option>
                <option value="FOUNDED">Founded</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Array.isArray(logs) && logs.map(log => (
                <div key={log?.id} style={{ padding: '15px', background: 'rgba(0, 0, 0, 0.03)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginBottom: '5px' }}>
                      {new Date(log?.timestamp).toLocaleString()} - User ID: {log?.user?.id} ({log?.user?.fullName || 'Unknown'})
                    </div>
                    <div>{log?.action}</div>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: log.filterCategory === 'RETURNED' ? 'var(--success)' : (log.filterCategory === 'LOST' || log.filterCategory === 'FOUNDED' ? 'var(--danger)' : 'var(--bg-tertiary)'),
                      color: (log.filterCategory === 'RETURNED' || log.filterCategory === 'LOST' || log.filterCategory === 'FOUNDED') ? 'white' : 'inherit',
                      borderRadius: '12px', 
                      fontSize: '0.8rem' 
                    }}>
                      {log.filterCategory}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
