import { useState, useEffect } from 'react';
import { FiShield, FiUserX } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    api.get('/admin/users').then((r) => setUsers(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === currentUser._id) return toast.error("You can't change your own role");
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change this user to ${newRole}?`)) return;
    try {
      const res = await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers((prev) => prev.map((u) => u._id === userId ? res.data.data : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    if (userId === currentUser._id) return toast.error("You can't deactivate yourself");
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} this user?`)) return;
    try {
      const res = await api.put(`/admin/users/${userId}`, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => u._id === userId ? res.data.data : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Role</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        disabled={u._id === currentUser._id}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-30"
                        title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                      >
                        <FiShield size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        disabled={u._id === currentUser._id}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <FiUserX size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
