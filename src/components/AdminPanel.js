import React, { useState, useEffect } from 'react';
import { CareerDayService } from '../lib/careerDayService';

const AdminPanel = ({ teacher, onLogout }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states - hapus selectedClass
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Hapus availableClasses state
  // const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    loadStudentData();
  }, [teacher]);

  const loadStudentData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Ambil data dari view teacher_student_event_view
      const { data, error } = await CareerDayService.getTeacherStudentEventView(
        teacher.classes, 
        teacher.is_admin
      );

      if (error) {
        throw new Error(error.message || 'Failed to load student data');
      }

      setStudents(data || []);
      setFilteredStudents(data || []);
      
      // Hapus bagian extract classes
      // const classes = [...new Set((data || []).map(student => student.student_kelas))].sort();
      // setAvailableClasses(classes);
      
    } catch (err) {
      console.error('Error loading student data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filter states change - hapus selectedClass
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, students]);

  const applyFilters = () => {
    let filtered = [...students];

    // Hapus filter by class
    // if (selectedClass !== 'all') {
    //   filtered = filtered.filter(student => student.student_kelas === selectedClass);
    // }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(student => 
        student.student_nama.toLowerCase().includes(term) ||
        student.student_nis.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'complete':
          filtered = filtered.filter(student => 
            student.event_1_topik && student.event_2_topik
          );
          break;
        case 'incomplete':
          filtered = filtered.filter(student => 
            !student.event_1_topik || !student.event_2_topik
          );
          break;
        case 'session_1_only':
          filtered = filtered.filter(student => 
            student.event_1_topik && !student.event_2_topik
          );
          break;
        case 'session_2_only':
          filtered = filtered.filter(student => 
            !student.event_1_topik && student.event_2_topik
          );
          break;
      }
    }

    setFilteredStudents(filtered);
  };

  const exportToCSV = () => {
    if (filteredStudents.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    // Header CSV
    const headers = [
      'NIS',
      'Nama',
      'Kelas',
      'Event 1 - Topik',
      'Event 1 - Bidang',
      'Event 1 - Lokasi',
      'Event 2 - Topik', 
      'Event 2 - Bidang',
      'Event 2 - Lokasi',
      'Status'
    ];

    // Convert data to CSV format
    const csvData = filteredStudents.map(student => [
      student.student_nis,
      student.student_nama,
      student.student_kelas,
      student.event_1_topik || '-',
      student.event_1_bidang || '-',
      student.event_1_lokasi || '-',
      student.event_2_topik || '-',
      student.event_2_bidang || '-', 
      student.event_2_lokasi || '-',
      (student.event_1_topik && student.event_2_topik) ? 'Lengkap' : 'Belum Lengkap'
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Update filename tanpa selectedClass
    link.setAttribute('href', url);
    link.setAttribute('download', `data_siswa_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const stats = {
    total: filteredStudents.length,
    event1: filteredStudents.filter(s => s.event_1_topik).length,
    event2: filteredStudents.filter(s => s.event_2_topik).length,
    incomplete: filteredStudents.filter(s => !s.event_1_topik || !s.event_2_topik).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Admin Panel Career Day
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Selamat datang, {teacher.name}
                {teacher.is_admin && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button 
              onClick={loadStudentData}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Filters - Update grid menjadi 3 kolom */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hapus Class Filter */}

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Siswa
              </label>
              <input
                type="text"
                placeholder="Nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Pendaftaran
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="complete">Lengkap (Kedua Sesi)</option>
                <option value="incomplete">Belum Lengkap</option>
                <option value="session_1_only">Session 1 Saja</option>
                <option value="session_2_only">Session 2 Saja</option>
              </select>
            </div>

            {/* Export Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Data
              </label>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  📊 Export CSV
                </button>
                <button
                  onClick={loadStudentData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  🔄
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Siswa</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sudah Daftar Event 1</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.event1}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sudah Daftar Event 2</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.event2}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Belum Lengkap</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.incomplete}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Data Siswa ({filteredStudents.length} dari {students.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event 1 (Sesi 1)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event 2 (Sesi 2)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.student_nis} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_nis}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.student_nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.student_kelas}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.event_1_topik ? (
                        <div>
                          <div className="font-medium">{student.event_1_topik}</div>
                          <div className="text-gray-500">{student.event_1_bidang}</div>
                          <div className="text-gray-400 text-xs">{student.event_1_lokasi}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Belum daftar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.event_2_topik ? (
                        <div>
                          <div className="font-medium">{student.event_2_topik}</div>
                          <div className="text-gray-500">{student.event_2_bidang}</div>
                          <div className="text-gray-400 text-xs">{student.event_2_lokasi}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Belum daftar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.event_1_topik && student.event_2_topik ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Lengkap
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ Belum Lengkap
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada data siswa yang ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
