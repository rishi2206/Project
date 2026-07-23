import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { UserPlus, Calendar, CreditCard, Clipboard, Search, AlertCircle, Plus, Trash2 } from 'lucide-react';
import styles from './ReceptionistDashboard.module.css';

// Ensures a <input type="time"> value ("HH:MM") is sent to the backend
// as a full "HH:MM:SS" time string.
const toBackendTime = (timeStr) => (timeStr && timeStr.length === 5 ? `${timeStr}:00` : timeStr);

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Form states - all start empty, nothing pre-filled.
  const [newPatient, setNewPatient] = useState({
    name: '', age: '', gender: '', phone: '', email: '', bloodGroup: '', emergencyContact: '',
  });
  const [newAppt, setNewAppt] = useState({ patientId: '', doctorId: '', date: '', time: '', notes: '' });
  const [newBill, setNewBill] = useState({
    appointmentId: '', consultationFee: '', medicineFee: '', otherCharges: '', paymentStatus: 'Unpaid',
  });
  const [medSearch, setMedSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [patientsRes, doctorsRes, appointmentsRes, billsRes, medicinesRes, prescriptionsRes] =
        await Promise.all([
          api.get('/patients/'),
          api.get('/doctors/'),
          api.get('/appointments/'),
          api.get('/bills/'),
          api.get('/medicines/'),
          api.get('/prescriptions/'),
        ]);

      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data);
      setBills(billsRes.data);
      setMedicines(medicinesRes.data);
      setPrescriptions(prescriptionsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load receptionist dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const patientNameById = (id) => patients.find((p) => p.id === id)?.name || 'Unknown Patient';
  const doctorNameById = (id) => doctors.find((d) => d.id === id)?.name || 'Unknown Doctor';

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const res = await api.post('/patients/', {
        name: newPatient.name,
        Gender: newPatient.gender,
        Age: Number(newPatient.age),
        Phone_number: newPatient.phone,
        email: newPatient.email,
        blood_group: newPatient.bloodGroup || null,
        emergency_contact: newPatient.emergencyContact || null,
      });
      setPatients((prev) => [...prev, res.data]);
      setNewPatient({ name: '', age: '', gender: '', phone: '', email: '', bloodGroup: '', emergencyContact: '' });
      setNotice(`Patient ${res.data.name} registered successfully.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register patient.');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const res = await api.post('/appointments/', {
        patient_id: newAppt.patientId,
        doctor_id: newAppt.doctorId,
        appointment_date: newAppt.date,
        appointment_time: toBackendTime(newAppt.time),
        notes: newAppt.notes || null,
      });
      setAppointments((prev) => [...prev, res.data]);
      setNewAppt({ patientId: '', doctorId: '', date: '', time: '', notes: '' });
      setNotice('Appointment booked successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment.');
    }
  };
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/appointments/${appointmentId}`);
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
      setNotice('Appointment deleted.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete appointment.');
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const appointment = appointments.find((a) => a.id === newBill.appointmentId);
    if (!appointment) return;

    try {
      const res = await api.post('/bills/', {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        consultation_fee: Number(newBill.consultationFee || 0),
        medicine_fee: Number(newBill.medicineFee || 0),
        other_charges: Number(newBill.otherCharges || 0),
        payment_status: newBill.paymentStatus,
        bill_date: new Date().toISOString().split('T')[0],
      });
      setBills((prev) => [res.data, ...prev]);
      setNewBill({ appointmentId: '', consultationFee: '', medicineFee: '', otherCharges: '', paymentStatus: 'Unpaid' });
      setNotice('Bill generated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create bill.');
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Delete this bill? This cannot be undone.')) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/bills/${billId}`);
      setBills((prev) => prev.filter((b) => b.id !== billId));
      setNotice('Bill deleted.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete bill.');
    }
  };



  const filteredMedicines = medicines.filter(
    (med) =>
      med.medicine_name.toLowerCase().includes(medSearch.toLowerCase()) ||
      (med.manufacture || '').toLowerCase().includes(medSearch.toLowerCase())
  );

  return (
    <div className={styles.dashboardContainer}>
      <aside className={`${styles.sidebar} glass`}>
        <button
          className={`${styles.navButton} ${activeTab === 'register' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <UserPlus size={18} />
          Register Patient
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'appointments' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          <Calendar size={18} />
          Scheduling
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'billing' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <CreditCard size={18} />
          Billing & Invoicing
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'pharmacy' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('pharmacy')}
        >
          <Clipboard size={18} />
          Pharmacy & Prescriptions
        </button>
      </aside>

      <div className={styles.contentArea}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>{notice}</div>
        )}

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading receptionist data...
          </div>
        ) : (
          <>
            {activeTab === 'register' && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Patient Registration</h2>
                    <p className={styles.sectionSubtitle}>Onboard new patients</p>
                  </div>
                </div>

                <div className={`${styles.card} glass`} style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }}>
                  <h3 className={styles.cardTitle}>Patient Form</h3>
                  <form onSubmit={handleCreatePatient} className={styles.form}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="pName">Patient Name</label>
                        <input
                          id="pName"
                          type="text"
                          value={newPatient.name}
                          onChange={(e) => setNewPatient((p) => ({ ...p, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="pAge">Age</label>
                        <input
                          id="pAge"
                          type="number"
                          min="0"
                          value={newPatient.age}
                          onChange={(e) => setNewPatient((p) => ({ ...p, age: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="pGender">Gender</label>
                        <select
                          id="pGender"
                          value={newPatient.gender}
                          onChange={(e) => setNewPatient((p) => ({ ...p, gender: e.target.value }))}
                          required
                        >
                          <option value="">Choose Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="pPhone">Contact Phone</label>
                        <input
                          id="pPhone"
                          type="text"
                          value={newPatient.phone}
                          onChange={(e) => setNewPatient((p) => ({ ...p, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="pEmail">Email</label>
                      <input
                        id="pEmail"
                        type="email"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="pBlood">Blood Group (optional)</label>
                        <input
                          id="pBlood"
                          type="text"
                          value={newPatient.bloodGroup}
                          onChange={(e) => setNewPatient((p) => ({ ...p, bloodGroup: e.target.value }))}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="pEmergency">Emergency Contact (optional)</label>
                        <input
                          id="pEmergency"
                          type="text"
                          value={newPatient.emergencyContact}
                          onChange={(e) => setNewPatient((p) => ({ ...p, emergencyContact: e.target.value }))}
                        />
                      </div>
                    </div>

                    <button type="submit" className="primary" style={{ marginTop: '0.5rem' }}>
                      <Plus size={16} />
                      Save Profile
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className={`${styles.cardGrid} animate-fade-in`}>
                <div className={`${styles.card} glass`}>
                  <h3 className={styles.cardTitle}>Schedule Appointment</h3>
                  <form onSubmit={handleBookAppointment} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="apptPatient">Select Patient</label>
                      <select
                        id="apptPatient"
                        value={newAppt.patientId}
                        onChange={(e) => setNewAppt((a) => ({ ...a, patientId: e.target.value }))}
                        required
                      >
                        <option value="">Choose Registered Patient</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Age: {p.Age})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="apptDoc">Select Doctor</label>
                      <select
                        id="apptDoc"
                        value={newAppt.doctorId}
                        onChange={(e) => setNewAppt((a) => ({ ...a, doctorId: e.target.value }))}
                        required
                      >
                        <option value="">Choose Attending Doctor</option>
                        {doctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} ({doc.specialization})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="apptDate">Date</label>
                        <input
                          id="apptDate"
                          type="date"
                          value={newAppt.date}
                          onChange={(e) => setNewAppt((a) => ({ ...a, date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="apptTime">Time</label>
                        <input
                          id="apptTime"
                          type="time"
                          value={newAppt.time}
                          onChange={(e) => setNewAppt((a) => ({ ...a, time: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="apptNotes">Reason for Visit</label>
                      <input
                        id="apptNotes"
                        type="text"
                        value={newAppt.notes}
                        onChange={(e) => setNewAppt((a) => ({ ...a, notes: e.target.value }))}
                      />
                    </div>

                    <button type="submit" className="primary" style={{ marginTop: '0.5rem' }}>
                      <Calendar size={16} />
                      Confirm Reservation
                    </button>
                  </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3 className={styles.cardTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        Active Calendar Slots
                      </h3>
                      <p className={styles.sectionSubtitle}>Currently booked patient consults</p>
                    </div>
                  </div>

                  <div className={styles.tableWrapper}>
                    {appointments.length > 0 ? (
                      <table className={styles.table}>
                       <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Date / Time</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appt) => (
                          <tr key={appt.id}>
                            <td style={{ fontWeight: '700' }}>{patientNameById(appt.patient_id)}</td>
                            <td>{doctorNameById(appt.doctor_id)}</td>
                            <td>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{appt.appointment_date}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{appt.appointment_time}</div>
                            </td>
                            <td>
                              <button className={styles.actionBtn} onClick={() => handleDeleteAppointment(appt.id)}>
                                <Trash2 size={14} /> Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody> 
                      </table>
                    ) : (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No appointments currently scheduled.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className={`${styles.cardGrid} animate-fade-in`}>
                <div className={`${styles.card} glass`}>
                  <h3 className={styles.cardTitle}>Billing</h3>
                  <form onSubmit={handleCreateBill} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="billAppt">For Appointment</label>
                      <select
                        id="billAppt"
                        value={newBill.appointmentId}
                        onChange={(e) => setNewBill((b) => ({ ...b, appointmentId: e.target.value }))}
                        required
                      >
                        <option value="">Choose Appointment</option>
                        {appointments.map((a) => (
                          <option key={a.id} value={a.id}>
                            {patientNameById(a.patient_id)} — {a.appointment_date}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className={styles.inputGroup}>
                        <label htmlFor="feeConsult">Consultation Fee</label>
                        <input
                          id="feeConsult"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newBill.consultationFee}
                          onChange={(e) => setNewBill((b) => ({ ...b, consultationFee: e.target.value }))}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="feeMed">Medicine Fee</label>
                        <input
                          id="feeMed"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newBill.medicineFee}
                          onChange={(e) => setNewBill((b) => ({ ...b, medicineFee: e.target.value }))}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label htmlFor="feeOther">Other Charges</label>
                        <input
                          id="feeOther"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newBill.otherCharges}
                          onChange={(e) => setNewBill((b) => ({ ...b, otherCharges: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="billStatus">Payment Status</label>
                      <select
                        id="billStatus"
                        value={newBill.paymentStatus}
                        onChange={(e) => setNewBill((b) => ({ ...b, paymentStatus: e.target.value }))}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>

                    <button type="submit" className="primary" style={{ marginTop: '0.5rem' }}>
                      <CreditCard size={16} />
                      Generate Statement
                    </button>
                  </form>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 className={styles.cardTitle}>Invoices History</h3>
                  <div className={styles.tableWrapper}>
                    {bills.length > 0 ? (
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bills.map((bill) => (
                            <tr key={bill.id}>
                              <td style={{ fontWeight: '700' }}>{patientNameById(bill.patient_id)}</td>
                              <td style={{ fontWeight: '600' }}>₹{Number(bill.total_amount).toFixed(2)}</td>
                              <td>
                                <span
                                  className={`${styles.badge} ${
                                    bill.payment_status?.toLowerCase() === 'paid' ? styles.badgePaid : styles.badgeUnpaid
                                  }`}
                                >
                                  {bill.payment_status}
                                </span>
                              </td>
                              <td>
                                <button className={styles.actionBtn} onClick={() => handleDeleteBill(bill.id)}>
                                  <Trash2 size={14} /> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No billing history recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pharmacy' && (
              <div className={`${styles.lookupWrapper} animate-fade-in`}>
                <div style={{ textAlign: 'left' }}>
                  <h2 className={styles.sectionTitle}>Medicines & Prescriptions</h2>
                  <p className={styles.sectionSubtitle}>Search clinical stock and view doctor prescriptions</p>
                </div>

                <div className={styles.cardGrid}>
                  <div className={`${styles.card} glass`}>
                    <h3 className={styles.cardTitle}>Pharmacy Stock Lookup</h3>
                    <div className={styles.searchSection}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="Search stock by name or manufacturer..."
                          value={medSearch}
                          onChange={(e) => setMedSearch(e.target.value)}
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>

                    <div className={styles.resultsGrid}>
                      {filteredMedicines.map((med) => (
                        <div key={med.id} className={styles.pharmacyCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className={styles.medName}>{med.medicine_name}</span>
                            <span
                              className={`${styles.badge} ${
                                med.stock > 0 ? styles.badgePaid : styles.badgeUnpaid
                              }`}
                            >
                              {med.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {med.manufacture}
                          </span>
                          <div className={styles.medDetails}>
                            <span>Stock: <strong>{med.stock} units</strong></span>
                            <span>Price: <strong>₹{Number(med.price).toFixed(2)}</strong></span>
                          </div>
                        </div>
                      ))}
                      {filteredMedicines.length === 0 && (
                        <div className={styles.emptyState || ''} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No medicines match your search.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`${styles.card} glass`}>
                    <h3 className={styles.cardTitle}>Doctor Prescription Logs</h3>
                    <div className={styles.prescriptionsWrapper}>
                      {prescriptions.map((presc) => (
                        <div key={presc.id} className={styles.prescriptionItem}>
                          <div className={styles.prescHeader}>
                            <span>{patientNameById(presc.patient_id)}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(presc.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className={styles.prescBody}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                              Prescribed by: {doctorNameById(presc.doctor_id)}
                            </div>
                            <p>{presc.instructions || 'No instructions recorded.'}</p>
                          </div>
                        </div>
                      ))}
                      {prescriptions.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No prescriptions recorded yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
