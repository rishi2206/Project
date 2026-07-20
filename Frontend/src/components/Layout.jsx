import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut } from 'lucide-react';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get initials for profile placeholder
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <Activity size={22} />
          </div>
          <span className={styles.logoText}>PulseCare HMS</span>
        </div>

        {user && (
          <div className={styles.userSection}>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                {getInitials(user.username)}
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.username}>{user.username}</span>
                <span className={styles.roleBadge}>{user.role}</span>
              </div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
