import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Verifying session credentials...</p>
      </div>
    );
  }

  if (!user) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={styles.deniedContainer}>
        <div className="glass" style={styles.deniedCard}>
          <div style={styles.iconContainer}>
            <ShieldAlert size={48} color="var(--color-danger)" />
          </div>
          <h2 style={styles.deniedTitle}>Access Denied</h2>
          <p style={styles.deniedText}>
            You do not have administrative clearance to access this terminal area. 
            This attempt has been logged under security audit protocols.
          </p>
          <div style={styles.userInfo}>
            <span>Active Session: <strong>{user.username}</strong></span>
            <span>Assigned Role: <span style={styles.roleBadge}>{user.role.toUpperCase()}</span></span>
          </div>
          <Link to={`/${user.role}`} style={styles.backButton}>
            <ArrowLeft size={18} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1.5rem',
    backgroundColor: 'var(--bg-primary)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid var(--border-color)',
    borderTop: '4px solid var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  deniedContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: 'var(--bg-primary)',
  },
  deniedCard: {
    maxWidth: '500px',
    width: '100%',
    padding: '3rem 2rem',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: 'var(--shadow-lg)',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  deniedTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '1rem',
  },
  deniedText: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  userInfo: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textAlign: 'left',
  },
  roleBadge: {
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    marginLeft: '0.5rem',
    display: 'inline-block',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    fontWeight: 600,
    width: '100%',
    transition: 'background-color 0.2s ease',
  },
};

// Add spinning keyframe animation dynamically if not present
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {
    console.warn('Could not inject spin keyframes dynamically', e);
  }
}

export default ProtectedRoute;
