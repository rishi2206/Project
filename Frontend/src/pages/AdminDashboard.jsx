import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import { Shield, Users, IndianRupee, Calendar, Eye, AlertCircle } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('admin-controls');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalPatients: 0,
    activeDoctors: 0,
    dailyRevenue: 0,
    activeUsersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roleNameById = useCallback(
    (roleId) => roles.find((r) => r.id === roleId)?.name || 'Unknown',
    [roles]
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, rolesRes, patientsRes, doctorsRes, billsRes] = await Promise.all([
        api.get('/users/'),
        api.get('/roles/'),
        api.get('/patients/'),
        api.get('/doctors/'),
        api.get('/bills/'),
      ]);

      setUsers(usersRes.data);
      setRoles(rolesRes.data);

      const today = new Date().toISOString().split('T')[0];
      const todaysRevenue = billsRes.data
        .filter((bill) => bill.bill_date === today)
        .reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);

      setSystemMetrics({
        totalPatients: patientsRes.data.length,
        activeDoctors: doctorsRes.data.length,
        dailyRevenue: todaysRevenue,
        activeUsersCount: usersRes.data.filter((u) => u.is_active).length,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}`, { is_active: !currentStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user status.');
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.titleSection}>
        <h2 className={styles.sectionTitle}>Administrative Command</h2>
        <p className={styles.sectionSubtitle}>
          Live user authorizations and hospital-wide metrics
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon}>
            <Users size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{systemMetrics.totalPatients}</span>
            <span className={styles.statLabel}>Registered Patients</span>
          </div>
        </div>
        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
            <Shield size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{systemMetrics.activeDoctors}</span>
            <span className={styles.statLabel}>Doctors on Record</span>
          </div>
        </div>
        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <IndianRupee size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              ₹{systemMetrics.dailyRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className={styles.statLabel}>Today's Revenue</span>
          </div>
        </div>
        <div className={`${styles.statCard} glass`}>
          <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
            <Calendar size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{systemMetrics.activeUsersCount}</span>
            <span className={styles.statLabel}>Active Accounts</span>
          </div>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'admin-controls' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('admin-controls')}
        >
          <Shield size={16} />
          User Accounts
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'doctor-view' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('doctor-view')}
        >
          <Eye size={16} />
          Doctor Dashboard View
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'receptionist-view' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('receptionist-view')}
        >
          <Eye size={16} />
          Receptionist Dashboard View
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Retrieving admin data...
        </div>
      ) : (
        <>
          {activeTab === 'admin-controls' && (
            <div className={`${styles.controlGrid} animate-fade-in`}>
              <div className={`${styles.card} glass`}>
                <h3 className={styles.cardTitle}>User Accounts Ledger</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: '700' }}>{u.username}</td>
                          <td>{u.email}</td>
                          <td>{roleNameById(u.role_id)}</td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                u.is_active ? styles.badgeActive : styles.badgeSuspended
                              }`}
                            >
                              {u.is_active ? 'active' : 'suspended'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                            >
                              {u.is_active ? 'Suspend Account' : 'Reactivate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'doctor-view' && (
            <div className={`${styles.subDashboardWrapper} glass animate-fade-in`}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} />
                <span><strong>ADMIN VIEW:</strong> You are viewing the Doctor Dashboard sub-module with live data.</span>
              </div>
              <DoctorDashboard />
            </div>
          )}

          {activeTab === 'receptionist-view' && (
            <div className={`${styles.subDashboardWrapper} glass animate-fade-in`}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} />
                <span><strong>ADMIN VIEW:</strong> You are viewing the Receptionist Dashboard sub-module with live data.</span>
              </div>
              <ReceptionistDashboard />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
