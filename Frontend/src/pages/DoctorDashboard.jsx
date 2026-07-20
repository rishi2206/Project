import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, ClipboardList, Search, AlertCircle, Send } from 'lucide-react';
import styles from './DoctorDashboard.module.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [patientSearch, setPatientSearch] = useState('');

  const [newPrescription, setNewPrescription] = useState({
    appointmentId: '',
    instructions: '',
  });

  const doctorId = user?.doctorId || null;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [patientsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        api.get('/patients/'),
        api.get('/appointments/'),
        api.get('/prescriptions/'),
      ]);

      setPatients(patientsRes.data);

      // The backend has no per-doctor filter on /appointments, so filter
      // client-side to this doctor's own appointments (falls back to
      // showing everything when there's no linked doctor profile, e.g.
      // when an Admin is previewing this dashboard).
      const doctorAppointments = doctorId
        ? appointmentsRes.data.filter((a) => a.doctor_id === doctorId)
        : appointmentsRes.data;
      setAppointments(doctorAppointments);

      const doctorPrescriptions = doctorId
        ? prescriptionsRes.data.filter((p) => p.doctor_id === doctorId)
        : prescriptionsRes.data;
      setPrescriptions(doctorPrescriptions);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const patientNameById = (patientId) =>
    patients.find((p) => p.id === patientId)?.name || 'Unknown Patient';

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!newPrescription.appointmentId) return;

    const appointment = appointments.find((a) => a.id === newPrescription.appointmentId);
    if (!appointment) return;

    try {
      const res = await api.post('/prescriptions/', {
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        appointment_id: appointment.id,
        instructions: newPrescription.instructions || null,
      });
      setPrescriptions((prev) => [res.data, ...prev]);
      setNewPrescription({ appointmentId: '', instructions: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create prescription.');
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className={styles.dashboardContainer}>
      <aside className={`${styles.sidebar} glass`}>
        <button
          className={`${styles.navButton} ${activeTab === 'patients' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <Users size={18} />
          Patient Records
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'appointments' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <Calendar size={18} />
          Appointments
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'prescriptions' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          <ClipboardList size={18} />
          Prescriptions
        </button>
      </aside>

      <div className={styles.contentArea}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading dashboard data...
          </div>
        ) : (
          <>
            {activeTab === 'patients' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className={styles.sectionHeader}>
                  <div className={styles.titleSection}>
                    <h2 className={styles.sectionTitle}>Patient Records</h2>
                    <p className={styles.sectionSubtitle}>View registered patient records</p>
                  </div>
                  <div className={styles.searchBar}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search patients by name..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div className={`${styles.statCard} glass`}>
                    <div className={styles.statIcon}>
                      <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                      <span className={styles.statValue}>{patients.length}</span>
                      <span className={styles.statLabel}>Total Registered Patients</span>
                    </div>
                  </div>
                  <div className={`${styles.statCard} glass`}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                      <Calendar size={20} />
                    </div>
                    <div className={styles.statInfo}>
                      <span className={styles.statValue}>{appointments.length}</span>
                      <span className={styles.statLabel}>Your Appointments</span>
                    </div>
                  </div>
                  <div className={`${styles.statCard} glass`}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                      <ClipboardList size={20} />
                    </div>
                    <div className={styles.statInfo}>
                      <span className={styles.statValue}>{prescriptions.length}</span>
                      <span className={styles.statLabel}>Prescriptions Issued</span>
                    </div>
                  </div>
                </div>

                <div className={styles.tableWrapper}>
                  {filteredPatients.length > 0 ? (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Age</th>
                          <th>Gender</th>
                          <th>Contact</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((patient) => (
                          <tr key={patient.id}>
                            <td style={{ fontWeight: '700' }}>{patient.name}</td>
                            <td>{patient.Age} yrs</td>
                            <td>{patient.Gender}</td>
                            <td>{patient.Phone_number}</td>
                            <td>{patient.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className={styles.emptyState}>No patients match your search.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className={styles.sectionHeader}>
                  <div className={styles.titleSection}>
                    <h2 className={styles.sectionTitle}>Consultation Schedule</h2>
                    <p className={styles.sectionSubtitle}>Appointments booked with you</p>
                  </div>
                </div>

                <div className={styles.tableWrapper}>
                  {appointments.length > 0 ? (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Notes</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appt) => (
                          <tr key={appt.id}>
                            <td style={{ fontWeight: '700' }}>{patientNameById(appt.patient_id)}</td>
                            <td>{appt.appointment_date}</td>
                            <td>{appt.appointment_time}</td>
                            <td>{appt.notes || '-'}</td>
                            <td>
                              <span
                                className={`${styles.badge} ${
                                  appt.status?.toLowerCase() === 'completed'
                                    ? styles.badgeSuccess
                                    : appt.status?.toLowerCase() === 'pending'
                                    ? styles.badgeWarning
                                    : styles.badgeInfo
                                }`}
                              >
                                {appt.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className={styles.emptyState}>No appointments scheduled.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className={`${styles.plannerGrid} animate-fade-in`}>
                <div className={`${styles.formCard} glass`}>
                  <h3 className={styles.formTitle}>Issue a Prescription</h3>
                  <form onSubmit={handleCreatePrescription} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="appointmentId">For Appointment</label>
                      <select
                        id="appointmentId"
                        value={newPrescription.appointmentId}
                        onChange={(e) =>
                          setNewPrescription((prev) => ({ ...prev, appointmentId: e.target.value }))
                        }
                        required
                      >
                        <option value="">-- Choose Appointment --</option>
                        {appointments.map((appt) => (
                          <option key={appt.id} value={appt.id}>
                            {patientNameById(appt.patient_id)} — {appt.appointment_date} {appt.appointment_time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="instructions">Instructions</label>
                      <textarea
                        id="instructions"
                        rows="4"
                        value={newPrescription.instructions}
                        onChange={(e) =>
                          setNewPrescription((prev) => ({ ...prev, instructions: e.target.value }))
                        }
                      />
                    </div>

                    <button type="submit" className="primary" style={{ marginTop: '0.5rem' }}>
                      <Send size={16} />
                      Save Prescription
                    </button>
                  </form>
                </div>

                <div className={`${styles.listCard} glass`}>
                  <h3 className={styles.formTitle}>Prescriptions Issued</h3>
                  <p className={styles.sectionSubtitle} style={{ marginBottom: '1.5rem' }}>
                    Prescriptions you have created for your patients.
                  </p>

                  {prescriptions.length > 0 ? (
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Instructions</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptions.map((presc) => (
                            <tr key={presc.id}>
                              <td style={{ fontWeight: '700' }}>{patientNameById(presc.patient_id)}</td>
                              <td>{presc.instructions || '-'}</td>
                              <td>{new Date(presc.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>No prescriptions issued yet.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
