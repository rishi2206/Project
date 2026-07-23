import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import { Shield, Users, IndianRupee, Calendar, Eye, AlertCircle, UserPlus, Package } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('admin-controls');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalPatients: 0,
    activeDoctors: 0,
    dailyRevenue: 0,
    activeUsersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [medicines, setMedicines] = useState([]);

  // Doctor profile registration form. A "Doctor" role user account (created
  // on the Register page) is only a login — it has no row in the `doctors`
  // table yet, so it won't show up in scheduling dropdowns until an Admin
  // fills this out and links it via user_id.
  const [doctorForm, setDoctorForm] = useState({
    userId: '',
    name: '',
    specialization: '',
    phoneNumber: '',
    email: '',
    department: '',
    yearsOfExperience: '',
  });

const [medicineForm, setMedicineForm] = useState({
  medicineName: '',
  description: '',
  stock: '',
  expiryDate: '',
  manufacture: '',
  price: '',
});

  const roleNameById = useCallback(
    (roleId) => roles.find((r) => r.id === roleId)?.name || 'Unknown',
    [roles]
  );

  const doctorRoleUsers = useMemo(
    () => users.filter((u) => roleNameById(u.role_id).toLowerCase() === 'doctor'),
    [users, roleNameById]
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, rolesRes, patientsRes, doctorsRes, billsRes, medicinesRes] = await Promise.all([
       api.get('/users/'),
       api.get('/roles/'),
       api.get('/patients/'),
       api.get('/doctors/'),
       api.get('/bills/'),
       api.get('/medicines/'),
      ]);

      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setDoctors(doctorsRes.data);
      setMedicines(medicinesRes.data);

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

  const handleRegisterDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!doctorForm.userId) {
      setError('Select which Doctor-role account this profile belongs to.');
      return;
    }

    try {
      const res = await api.post('/doctors/', {
        user_id: doctorForm.userId,
        name: doctorForm.name,
        specialization: doctorForm.specialization,
        phone_number: doctorForm.phoneNumber,
        email: doctorForm.email,
        department: doctorForm.department,
        years_of_experience: Number(doctorForm.yearsOfExperience),
      });
      setDoctors((prev) => [...prev, res.data]);
      setSystemMetrics((m) => ({ ...m, activeDoctors: m.activeDoctors + 1 }));
      setDoctorForm({
        userId: '',
        name: '',
        specialization: '',
        phoneNumber: '',
        email: '',
        department: '',
        yearsOfExperience: '',
      });
      setNotice(`Doctor profile for ${res.data.name} created — they'll now appear in scheduling.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register doctor profile.');
    }
  };

  const handleAddMedicine = async (e) => {
  e.preventDefault();
  setError('');
  setNotice('');
  try {
    const res = await api.post('/medicines/', {
      medicine_name: medicineForm.medicineName,
      description: medicineForm.description || null,
      stock: Number(medicineForm.stock),
      expiry_date: medicineForm.expiryDate,
      manufacture: medicineForm.manufacture,
      price: Number(medicineForm.price),
      unit: Number(medicineForm.unit),
    });
    setMedicines((prev) => [...prev, res.data]);
    setMedicineForm({ medicineName: '', description: '', stock: '', expiryDate: '', manufacture: '', price: '', unit: '' });
    setNotice(`Medicine "${res.data.medicine_name}" added to inventory.`);
  } catch (err) {
    setError(err.response?.data?.detail || 'Failed to add medicine.');
  }
};

  const [stockEdits, setStockEdits] = useState({});

  const handleUpdateStock = async (medicineId) => { 
  const newStock = stockEdits[medicineId];
  if (newStock === undefined || newStock === '') return;
  setError('');
  setNotice('');
  try {
    const res = await api.put(`/medicines/${medicineId}`, { stock: Number(newStock) });
    setMedicines((prev) => prev.map((m) => (m.id === medicineId ? res.data : m)));
    setStockEdits((prev) => ({ ...prev, [medicineId]: '' }));
    setNotice(`Stock updated for ${res.data.medicine_name}.`);
  } catch (err) {
    setError(err.response?.data?.detail || 'Failed to update stock.');
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
      {notice && (
        <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>{notice}</div>
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
        <button
          className={`${styles.tabBtn} ${activeTab === 'medicines' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('medicines')}
>
          <Package size={16} />
             Medicine Inventory
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className={`${styles.card} glass`}>
                  <h3 className={styles.cardTitle}>Register Doctor Profile</h3>
                  <p className={styles.sectionSubtitle} style={{ marginBottom: '1rem' }}>
                    A Doctor-role account only creates a login. Link it to a profile here so it
                    appears in patient scheduling.
                  </p>
                  <form onSubmit={handleRegisterDoctor} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="docUser">Doctor Account</label>
                      <select
                        id="docUser"
                        value={doctorForm.userId}
                        onChange={(e) => setDoctorForm((f) => ({ ...f, userId: e.target.value }))}
                        required
                      >
                        <option value="">-- Choose Doctor-role Account --</option>
                        {doctorRoleUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.username} ({u.email})
                          </option>
                        ))}
                      </select>
                      {doctorRoleUsers.length === 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          No Doctor-role accounts found. Have the doctor register at /register with
                          the "Doctor" role first.
                        </span>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="docName">Full Name</label>
                      <input
                        id="docName"
                        type="text"
                        value={doctorForm.name}
                        onChange={(e) => setDoctorForm((f) => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="docSpecialization">Specialization</label>
                      <input
                        id="docSpecialization"
                        type="text"
                        value={doctorForm.specialization}
                        onChange={(e) =>
                          setDoctorForm((f) => ({ ...f, specialization: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="docDepartment">Department</label>
                      <input
                        id="docDepartment"
                        type="text"
                        value={doctorForm.department}
                        onChange={(e) => setDoctorForm((f) => ({ ...f, department: e.target.value }))}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="docPhone">Phone Number</label>
                      <input
                        id="docPhone"
                        type="text"
                        value={doctorForm.phoneNumber}
                        onChange={(e) =>
                          setDoctorForm((f) => ({ ...f, phoneNumber: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="docEmail">Email</label>
                      <input
                        id="docEmail"
                        type="email"
                        value={doctorForm.email}
                        onChange={(e) => setDoctorForm((f) => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="docExperience">Years of Experience</label>
                      <input
                        id="docExperience"
                        type="number"
                        min="0"
                        value={doctorForm.yearsOfExperience}
                        onChange={(e) =>
                          setDoctorForm((f) => ({ ...f, yearsOfExperience: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <button type="submit" className="primary" style={{ marginTop: '0.5rem' }}>
                      <UserPlus size={16} />
                      Create Doctor Profile
                    </button>
                  </form>
                </div>

                <div className={`${styles.card} glass`}>
                  <h3 className={styles.cardTitle}>Doctors on Record</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Department</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.map((d) => (
                          <tr key={d.id}>
                            <td style={{ fontWeight: '700' }}>{d.name}</td>
                            <td>{d.department}</td>
                          </tr>
                        ))}
                        {doctors.length === 0 && (
                          <tr>
                            <td colSpan={2} style={{ textAlign: 'center', padding: '2rem' }}>
                              No doctor profiles yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medicines' && (
  <div className={`${styles.controlGrid} animate-fade-in`}>
    <div className={`${styles.card} glass`}>
      <h3 className={styles.cardTitle}>Add Medicine</h3>
      <form onSubmit={handleAddMedicine} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="medName">Medicine Name</label>
          <input
            id="medName"
            type="text"
            value={medicineForm.medicineName}
            onChange={(e) => setMedicineForm((f) => ({ ...f, medicineName: e.target.value }))}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="medDescription">Description</label>
          <input
            id="medDescription"
            type="text"
            value={medicineForm.description}
            onChange={(e) => setMedicineForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.inputGroup}>
            <label htmlFor="medStock">Stock</label>
            <input
              id="medStock"
              type="number"
              min="0"
              value={medicineForm.stock}
              onChange={(e) => setMedicineForm((f) => ({ ...f, stock: e.target.value }))}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="medPrice">Price</label>
            <input
              id="medPrice"
              type="number"
              step="0.01"
              min="0"
              value={medicineForm.price}
              onChange={(e) => setMedicineForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="medUnit">Unit</label>
            <select
            id="medUnit"
            value={medicineForm.unit}
            onChange={(e) => setMedicineForm((f) => ({ ...f, unit: e.target.value }))}
            required
            >
            <option value="">Choose Unit</option>
            <option value="Tablet">Tablet</option>
            <option value="Strip">Strip</option>
            <option value="Bottle">Bottle</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
            <option value="Box">Box</option>
            </select>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="medManufacture">Manufacturer</label>
          <input
            id="medManufacture"
            type="text"
            value={medicineForm.manufacture}
            onChange={(e) => setMedicineForm((f) => ({ ...f, manufacture: e.target.value }))}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="medUnit">Unit</label>
          <select
          id="medUnit"
          value={medicineForm.unit}
          onChange={(e) => setMedicineForm((f) => ({ ...f, unit: e.target.value }))}
          required
          >
          <option value="">Choose Unit</option>
          <option value="Tablet">Tablet</option>
          <option value="Strip">Strip</option>
          <option value="Bottle">Bottle</option>
          <option value="Syrup">Syrup</option>
          <option value="Injection">Injection</option>
          <option value="Box">Box</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="medExpiry">Expiry Date</label>
          <input
            id="medExpiry"
            type="date"
            value={medicineForm.expiryDate}
            onChange={(e) => setMedicineForm((f) => ({ ...f, expiryDate: e.target.value }))}
            required
          />
        </div>

        <button type="submit" className="primary" style={{ marginTop: '0.5rem' }}>
          <Package size={16} />
          Add Medicine
        </button>
      </form>
    </div>

    <div className={`${styles.card} glass`}>
      <h3 className={styles.cardTitle}>Medicines on Record</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
  <tr>
    <th>Name</th>
    <th>Unit</th>
    <th>Manufacturer</th>
    <th>Stock</th>
    <th>Price</th>
    <th>Expiry</th>
    <th>Update Stock</th>
  </tr>
</thead>
<tbody>
  {medicines.map((m) => (
    <tr key={m.id}>
      <td style={{ fontWeight: '700' }}>{m.medicine_name}</td>
      <td>{m.unit}</td>
      <td>{m.manufacture}</td>
      <td>{m.stock}</td>
      <td>₹{Number(m.price).toFixed(2)}</td>
      <td>{m.expiry_date}</td>
      <td>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            min="0"
            placeholder={m.stock}
            style={{ width: '70px' }}
            value={stockEdits[m.id] ?? ''}
            onChange={(e) => setStockEdits((prev) => ({ ...prev, [m.id]: e.target.value }))}
          />
          <button className={styles.actionBtn} onClick={() => handleUpdateStock(m.id)}>
            Save
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
