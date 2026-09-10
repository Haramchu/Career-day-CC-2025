import React, { useState, useEffect } from 'react';
import { CareerDayService } from '../lib/careerDayService';

const ITEMS_PER_PAGE = 10;

const AdminPanel = ({ teacher, onLogout }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'student_kelas', direction: 'asc' });


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
      
      // const classes = [...new Set((data || []).map(student => student.student_kelas))].sort();
      // setAvailableClasses(classes);
      
    } catch (err) {
      console.error('Error loading student data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    applyFilters();
  }, [searchTerm, statusFilter, students]);

  const applyFilters = () => {
    let filtered = [...students];

    // filter by class
    // if (selectedClass !== 'all') {
    //   filtered = filtered.filter(student => student.student_kelas === selectedClass);
    // }

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

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `data_siswa_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (key) => {
    setSortConfig((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const getSortValue = (student, key) => {
    switch (key) {
      case 'status':
        return student.event_1_topik && student.event_2_topik ? 'Lengkap' : 'Belum Lengkap';
      case 'event_1':
        return student.event_1_topik || '';
      case 'event_2':
        return student.event_2_topik || '';
      default:
        return student[key] || '';
    }
  };

  const sortedStudents = [...filteredStudents].sort((firstStudent, secondStudent) => {
    const firstValue = getSortValue(firstStudent, sortConfig.key).toString().toLowerCase();
    const secondValue = getSortValue(secondStudent, sortConfig.key).toString().toLowerCase();
    const firstIsEmpty = firstValue === '';
    const secondIsEmpty = secondValue === '';

    if (firstIsEmpty !== secondIsEmpty) {
      return firstIsEmpty ? 1 : -1;
    }

    const comparison = firstValue.localeCompare(secondValue, undefined, { numeric: true });
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Calculate statistics
  const stats = {
    total: filteredStudents.length,
    event1: filteredStudents.filter(s => s.event_1_topik).length,
    event2: filteredStudents.filter(s => s.event_2_topik).length,
    incomplete: filteredStudents.filter(s => !s.event_1_topik || !s.event_2_topik).length
  };
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = sortedStudents.slice(pageStartIndex, pageStartIndex + ITEMS_PER_PAGE);
  const tableRows = currentPage < totalPages
    ? [...paginatedStudents, ...Array(Math.max(ITEMS_PER_PAGE - paginatedStudents.length, 0)).fill(null)]
    : paginatedStudents;
  const paginationItems = totalPages <= 4
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : currentPage <= 3
      ? [1, 2, 3, 4, 'ellipsis-end', totalPages]
      : currentPage >= totalPages - 2
        ? [1, 'ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
        : [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];

  const renderSortHeader = (label, key) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="inline-flex items-center justify-center gap-1 hover:text-yellow-300 transition-colors"
    >
      <span>{label}</span>
      <span className="text-[10px]" aria-hidden="true">
        {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white/80">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>
      <header className="relative z-10 border-b border-white/20 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-6">
            <div>
              <p className="text-yellow-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">Career Day 2025</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Admin Panel
              </h1>
              <p className="mt-1 text-sm text-white/80">
                Selamat datang, {teacher.name}
                {teacher.is_admin && (
                  <span className="ml-2 px-2 py-1 bg-yellow-400/20 text-yellow-200 text-xs rounded-full border border-yellow-400/30">
                    Admin
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
        {error && (
          <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
            <p>{error}</p>
            <button 
              onClick={loadStudentData}
              className="mt-2 bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-full text-sm transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Filters - Update grid menjadi 3 kolom */}
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-2xl mb-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hapus Class Filter */}

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cari Siswa
              </label>
              <input
                type="text"
                placeholder="Nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status Pendaftaran
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option className="bg-gray-950 text-white" value="all">Semua Status</option>
                <option className="bg-gray-950 text-white" value="complete">Lengkap (Kedua Sesi)</option>
                <option className="bg-gray-950 text-white" value="incomplete">Belum Lengkap</option>
                <option className="bg-gray-950 text-white" value="session_1_only">Session 1 Saja</option>
                <option className="bg-gray-950 text-white" value="session_2_only">Session 2 Saja</option>
              </select>
            </div>

            {/* Export Button */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Export Data
              </label>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
                >
                  📊 Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-200 font-semibold">👥</span>
                </div>
              </div>
              <div className="mt-3 w-full">
                <p className="text-sm font-medium text-white/70">Total Siswa</p>
                <p className="text-2xl font-semibold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                  <span className="text-green-200 font-semibold">✅</span>
                </div>
              </div>
              <div className="mt-3 w-full">
                <p className="text-sm font-medium text-white/70">Sudah Daftar Event 1</p>
                <p className="text-2xl font-semibold text-white">{stats.event1}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-200 font-semibold">🎯</span>
                </div>
              </div>
              <div className="mt-3 w-full">
                <p className="text-sm font-medium text-white/70">Sudah Daftar Event 2</p>
                <p className="text-2xl font-semibold text-white">{stats.event2}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-400/20 rounded-full flex items-center justify-center">
                  <span className="text-red-200 font-semibold">❌</span>
                </div>
              </div>
              <div className="mt-3 w-full">
                <p className="text-sm font-medium text-white/70">Belum Lengkap</p>
                <p className="text-2xl font-semibold text-white">{stats.incomplete}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-white/20">
            <h3 className="text-base sm:text-lg font-medium text-white">
              Data Siswa ({filteredStudents.length} dari {students.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed divide-y divide-white/10">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
                <col className="w-[24%]" />
                <col className="w-[24%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-3 text-center align-middle text-xs font-medium text-white/70 uppercase tracking-wider">
                    {renderSortHeader('NIS', 'student_nis')}
                  </th>
                  <th className="px-6 py-3 text-center align-middle text-xs font-medium text-white/70 uppercase tracking-wider">
                    {renderSortHeader('Nama', 'student_nama')}
                  </th>
                  <th className="px-6 py-3 text-center align-middle text-xs font-medium text-white/70 uppercase tracking-wider">
                    {renderSortHeader('Kelas', 'student_kelas')}
                  </th>
                  <th className="px-6 py-3 text-center align-middle text-xs font-medium text-white/70 uppercase tracking-wider">
                    {renderSortHeader('Event 1 (Sesi 1)', 'event_1')}
                  </th>
                  <th className="px-6 py-3 text-center align-middle text-xs font-medium text-white/70 uppercase tracking-wider">
                    {renderSortHeader('Event 2 (Sesi 2)', 'event_2')}
                  </th>
                  <th className="px-6 py-3 text-center align-middle text-xs font-medium text-white/70 uppercase tracking-wider">
                    {renderSortHeader('Status', 'status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {tableRows.map((student, index) => (
                  <tr key={student?.student_nis || `empty-row-${index}`} className="h-24 hover:bg-white/10 transition-colors">
                    <td className="px-4 sm:px-6 py-4 align-top text-sm font-medium text-white break-words">
                      {student?.student_nis || ''}
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-top text-sm text-white break-words">
                      {student?.student_nama || ''}
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-top text-sm text-white/70 break-words">
                      {student?.student_kelas || ''}
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-top text-sm text-white break-words">
                      {student?.event_1_topik ? (
                        <div className="min-h-16">
                          <div className="font-medium">{student.event_1_topik}</div>
                          <div className="text-white/70">{student.event_1_bidang}</div>
                          <div className="text-white/50 text-xs">{student.event_1_lokasi}</div>
                        </div>
                      ) : (
                        <span className="text-white/50 italic">{student ? 'Belum daftar' : ''}</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-top text-sm text-white break-words">
                      {student?.event_2_topik ? (
                        <div className="min-h-16">
                          <div className="font-medium">{student.event_2_topik}</div>
                          <div className="text-white/70">{student.event_2_bidang}</div>
                          <div className="text-white/50 text-xs">{student.event_2_lokasi}</div>
                        </div>
                      ) : (
                        <span className="text-white/50 italic">{student ? 'Belum daftar' : ''}</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-top">
                      {student && (
                        student.event_1_topik && student.event_2_topik ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ❌ Belum Lengkap
                          </span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/70">Tidak ada data siswa yang ditemukan.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 px-4 sm:px-6 py-5 border-t border-white/20">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {paginationItems.map((page) => (
                typeof page === 'string' ? (
                  <span key={page} className="w-9 h-9 flex items-center justify-center text-white/70">
                    ...
                  </span>
                ) : (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                        : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
