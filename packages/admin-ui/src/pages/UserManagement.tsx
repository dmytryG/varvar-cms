import React, { useState, useEffect } from 'react';
import {Header} from "../components/Header.tsx";
import {PageWithSideMenu} from "../components/PageWithSideMenu.tsx";
import {APIService, type User} from "../services/APIService.ts";
import {toast} from "react-toastify";

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = APIService.getCurrentUser;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersList = await APIService.listUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'USER') => {
    if (currentUser?.id === userId) {
      toast.error('You cannot change your own role');
      return;
    }
    
    try {
      await APIService.setUserRole(userId, newRole);
      await loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
      toast.error('You cannot delete yourself');
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await APIService.deleteUser(userId);
      await loadUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
        <Header strictAuth={true} toDashIfLoggedIn={false}/>
        <PageWithSideMenu>
            <div>
              <h2>User Management</h2>
              {loading ? (
                <div>Loading users...</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {user.email}
                          {currentUser?.id === user.id && ' (You)'}
                        </td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as 'ADMIN' | 'USER')}
                            disabled={currentUser?.id === user.id}

                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={currentUser?.id === user.id}
                            style={{
                              cursor: currentUser?.id === user.id ? 'not-allowed' : 'pointer',
                              opacity: currentUser?.id === user.id ? 0.5 : 1
                            }}
                            className={'red-background'}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
        </PageWithSideMenu>
    </div>
  );
};