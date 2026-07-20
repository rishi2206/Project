import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, FileText } from 'lucide-react';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className={styles.heroContainer}>
      <div className={`${styles.heroCard} glass animate-fade-in`}>
        <div className={styles.logoBadge}>
          <Activity size={32} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <span className={styles.tagline}>Healthcare Management</span>
          <h1 className={styles.title}>
            Hospital <span className={styles.highlight}>Hub</span>
          </h1>
          <p className={styles.subtitle}>
            A centralized dashboard connecting doctors, receptionists, and administration to coordinate care, schedule resources, and streamline clinical billing.
          </p>
        </div>

        <div className={styles.actions}>
          <Link to="/login" className={`${styles.btnAction} ${styles.btnLogin}`}>
            Login
          </Link>
          <Link to="/register" className={`${styles.btnAction} ${styles.btnRegister}`}>
            Register
          </Link>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <Heart className={styles.featureIcon} size={20} />
            <h3 className={styles.featureTitle}>Clinical Dashboards</h3>
            <p className={styles.featureDesc}>
              Doctors manage real-time patient charts, appointments, and weekly availability slots.
            </p>
          </div>
          <div className={styles.featureCard}>
            <FileText className={styles.featureIcon} size={20} />
            <h3 className={styles.featureTitle}>Reception & Billing</h3>
            <p className={styles.featureDesc}>
              Receptionists register patients, book clinical visits, and manage prescription inventory.
            </p>
          </div>
          <div className={styles.featureCard}>
            <ShieldCheck className={styles.featureIcon} size={20} />
            <h3 className={styles.featureTitle}>Administrative Audit</h3>
            <p className={styles.featureDesc}>
              System admins control platform access, audit logs, and monitor high-level metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
