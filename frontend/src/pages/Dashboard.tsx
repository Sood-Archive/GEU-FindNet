import { useState, useContext, useEffect, FormEvent } from 'react';
import { AuthContext, api } from '../AuthContext';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'LOST' | 'FOUND' | 'ACTIVITY'>('LOST');
  const [activities, setActivities] = useState<any[]>([]);

  // Form State
  const [itemData, setItemData] = useState({
    name: '',
    location: '',
    description: '',
    contactPhone: '',
    type: 'LOST_REPORT'
  });
  const [msg, setMsg] = useState('');

  const fetchActivity = async () => {
    try {
      if (user) {
        const res = await api.get(`/items/my-activity?userId=${user.id}`);
        setActivities(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'ACTIVITY') {
      fetchActivity();
    }
  }, [activeTab]);

  const handleReport = async (e: FormEvent, type: 'LOST_REPORT' | 'FOUND_REPORT') => {
    e.preventDefault();
    setMsg('');
    try {
      const payload = {
        ...itemData,
        type,
        status: type === 'LOST_REPORT' ? 'LOST' : 'FOUND'
      };
      await api.post(`/items/report?userId=${user?.id}`, payload);
      setMsg(`${type === 'LOST_REPORT' ? 'Lost' : 'Found'} item reported successfully!`);
      setItemData({ name: '', location: '', description: '', contactPhone: '', type: 'LOST_REPORT' });
    } catch (err) {
      setMsg('Failed to report item.');
    }
  };

  const navItemStyle = (tab: string) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '2px solid var(--accent-color)' : 'transparent',
    color: activeTab === tab ? 'var(--accent-color)' : 'var(--text-secondary)',
    fontWeight: activeTab === tab ? '600' : '400',
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="logo" style={{ margin: 0, fontSize: '1.8rem' }}><span className="logo-geu">GEU</span> <span className="logo-findnet">FindNet</span></h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span>Welcome, {user?.fullName}</span>
          <button onClick={logout} className="danger">Logout</button>
        </div>
      </div>

      <div className="glass-panel">
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--border-glass)' }}>
          <div onClick={() => setActiveTab('LOST')} style={navItemStyle('LOST')}>Lost Something</div>
          <div onClick={() => setActiveTab('FOUND')} style={navItemStyle('FOUND')}>Found Something</div>
          <div onClick={() => setActiveTab('ACTIVITY')} style={navItemStyle('ACTIVITY')}>Your Activity</div>
        </div>

        {activeTab === 'LOST' && (
          <form onSubmit={(e) => handleReport(e, 'LOST_REPORT')} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Report Lost Item</h2>
            {msg && <p style={{ color: 'var(--success)' }}>{msg}</p>}
            <div className="input-group">
              <label>Item Name</label>
              <input type="text" required value={itemData.name} onChange={e => setItemData({...itemData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Location Lost</label>
              <input type="text" required value={itemData.location} onChange={e => setItemData({...itemData, location: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea required rows={4} value={itemData.description} onChange={e => setItemData({...itemData, description: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Contact Phone</label>
              <input type="text" required value={itemData.contactPhone} onChange={e => setItemData({...itemData, contactPhone: e.target.value})} />
            </div>
            <button type="submit" className="primary">Mark as Lost</button>
          </form>
        )}

        {activeTab === 'FOUND' && (
          <form onSubmit={(e) => handleReport(e, 'FOUND_REPORT')} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Report Found Item</h2>
            {msg && <p style={{ color: 'var(--success)' }}>{msg}</p>}
            <div className="input-group">
              <label>Item Name</label>
              <input type="text" required value={itemData.name} onChange={e => setItemData({...itemData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Location Found</label>
              <input type="text" required value={itemData.location} onChange={e => setItemData({...itemData, location: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Description (Details)</label>
              <textarea required rows={4} value={itemData.description} onChange={e => setItemData({...itemData, description: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Your Contact Phone</label>
              <input type="text" required value={itemData.contactPhone} onChange={e => setItemData({...itemData, contactPhone: e.target.value})} />
            </div>
            <button type="submit" className="primary">Mark as Founded</button>
          </form>
        )}

        {activeTab === 'ACTIVITY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2>Your Timeline</h2>
            {activities.length === 0 ? <p>No activity found.</p> : null}
            {activities.map((log: any) => (
              <div key={log.id} style={{ padding: '15px', background: 'rgba(0, 0, 0, 0.03)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginBottom: '5px' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div>{log.action}</div>
                <div style={{ marginTop: '10px' }}>
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
        )}
      </div>
    </div>
  );
}
