import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Activity, User, Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roleId: '',
  });

  const [roles, setRoles] = useState([]);
  const [rolesError, setRolesError] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Roles come straight from the backend (GET /roles) - no hardcoded
  // list here, so this always reflects whatever roles actually exist
  // in the database.
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await api.get('/roles/');
        setRoles(res.data);
      } catch (err) {
        setRolesError('Could not load available roles from the server.');
      }
    };
    loadRoles();
  }, []);

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.username.trim()) {
      tempErrors.username = 'Full name is required';
    } else if (formData.username.trim().length < 3) {
      tempErrors.username = 'Name must be at least 3 characters';
    }

    if (!formData.email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.roleId) {
      tempErrors.roleId = 'Please select a system access role';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    const res = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.roleId
    );
    setIsSubmitting(false);

    if (res.success) {
      const role = res.user.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'doctor') {
        navigate('/doctor');
      } else if (role === 'receptionist') {
        navigate('/receptionist');
      } else {
        navigate('/');
      }
    } else {
      setApiError(res.error || 'Registration failed. Try a different email.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.registerCard} glass`}>
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <Activity size={24} />
          </div>
          <h2 className={styles.title}>Register Account</h2>
          <p className={styles.subtitle}>Create clinical credentials for PulseCare HMS</p>
        </div>

        {apiError && (
          <div className={styles.apiErrorAlert}>
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        {rolesError && (
          <div className={styles.apiErrorAlert}>
            <AlertCircle size={18} />
            <span>{rolesError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your full name"
                value={formData.username}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isSubmitting}
              />
            </div>
            {errors.username && <span className={styles.errorText}>{errors.username}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Security Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={styles.inputField}
                disabled={isSubmitting}
              />
            </div>
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="roleId">Role Selection</label>
            <div className={styles.inputWrapper}>
              <Shield className={styles.inputIcon} size={18} />
              <select
                id="roleId"
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className={`${styles.inputField} ${styles.selectField}`}
                disabled={isSubmitting || roles.length === 0}
              >
                <option value="">-- Choose Access Permission --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.roleId && <span className={styles.errorText}>{errors.roleId}</span>}
          </div>

          <button
            type="submit"
            className="primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering Credentials...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          Already have a portal account?{' '}
          <Link to="/login" className={styles.link}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
