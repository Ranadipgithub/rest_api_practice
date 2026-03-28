import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  LogOut, Plus, Edit2, Trash2, CheckCircle, 
  Circle, Clock, AlertCircle, ShieldAlert 
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', status: 'pending' });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', description: '', priority: 'medium', status: 'pending' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 
                      task.status === 'pending' ? 'in-progress' : 'completed';
    try {
      await api.put(`/tasks/${task._id}`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const editTask = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status
    });
    setEditingId(task._id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', priority: 'medium', status: 'pending' });
  };

  return (
    <div className="container animate-fade-in">
      {/* Header section */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' 
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Welcome back, <strong style={{ color: 'white' }}>{user?.name}</strong>
            {user?.role === 'admin' && (
              <span className="badge badge-error" style={{ background: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ShieldAlert size={12} /> Admin
              </span>
            )}
          </p>
        </div>
        <button onClick={logout} className="btn btn-ghost">
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {/* Task Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>{user?.role === 'admin' ? 'All System Tasks' : 'Your Tasks'}</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={18} />
            New Task
          </button>
        )}
      </div>

      {/* Task Form */}
      {showForm && (
        <form onSubmit={handleSaveTask} className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingId ? 'Edit Task' : 'Create New Task'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }} className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="Task title" />
            </div>
            
            <div style={{ gridColumn: '1 / -1' }} className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Task description (optional)" rows={3} />
            </div>
            
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleInputChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">Save Task</button>
            <button type="button" onClick={cancelEdit} className="btn btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CheckCircle size={32} color="var(--text-muted)" />
          </div>
          <h3>No tasks found</h3>
          <p style={{ marginTop: '0.5rem' }}>You're all caught up! Create a new task to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tasks.map(task => (
            <div key={task._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              
              {/* Status Toggle Button */}
              <button 
                onClick={() => toggleStatus(task)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem', padding: 0 }}
              >
                {task.status === 'completed' ? (
                  <CheckCircle size={24} color="var(--success)" />
                ) : task.status === 'in-progress' ? (
                  <Clock size={24} color="var(--primary)" />
                ) : (
                  <Circle size={24} color="var(--text-muted)" />
                )}
              </button>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-main)', fontSize: '1.125rem' }}>
                    {task.title}
                  </h3>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => editTask(task)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }}>
                      <Edit2 size={16} />
                    </button>
                    {(user._id === task.user?._id || user.role === 'admin') && (
                      <button onClick={() => handleDeleteTask(task._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                {task.description && (
                  <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>{task.description}</p>
                )}
                
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', alignItems: 'center' }}>
                  <span className={`badge badge-${task.status}`}>{task.status.replace('-', ' ')}</span>
                  <span className={`badge badge-${task.priority}`}>
                    {task.priority === 'high' && <AlertCircle size={10} style={{ display: 'inline', marginRight: '4px' }} />}
                    {task.priority}
                  </span>
                  
                  {user.role === 'admin' && task.user && (
                    <span style={{ color: 'var(--text-muted)' }}>• by {task.user.name}</span>
                  )}
                  
                  <span style={{ color: 'var(--text-muted)' }}>
                    • Updated {new Date(task.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
