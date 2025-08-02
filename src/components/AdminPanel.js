import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminPanel = ({ teacher, onLogout }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const { data, error } = await supabase
          .from('teacher_student_overview')
          .select('*')
          .order('class', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;

        // Filter berdasarkan kelas yang diampu guru (jika bukan admin)
        let filteredData = data;
        if (!teacher.is_admin && teacher.classes) {
          filteredData = data.filter(student => 
            teacher.classes.includes(student.class)
          );
        }

        setStudents(filteredData);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError('Gagal memuat data siswa');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacher]);

  // Filter siswa berdasarkan kelas dan pencarian
  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.nis.includes(searchTerm);
    return matchesClass && matchesSearch;
  });

  // Dapatkan daftar kelas unik
  const uniqueClasses = [...new Set(students.map(student => student.class))].sort();

  const exportToCSV = () => {
    const headers = ['NIS', 'Nama', 'Kelas', 'Event 1', 'Speaker 1', 'Lokasi 1', 'Event 2', 'Speaker 2', 'Lokasi 2'];
    const csvData = filteredStudents.map(student => [
      student.nis,
      student.name,
      student.class,
      student.event_1_topic || '-',
      student.event_1_speaker || '-',
      student.event_1_location || '-',
      student.event_2_topic || '-',
      student.event_2_speaker || '-',
      student.event_2_location || '-'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_siswa_${selectedClass}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel Career Day</h1>
              <p className="text-gray-600">
                Selamat datang, {teacher.name} ({teacher.nip})
                {teacher.is_admin && <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Admin</span>}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Kelas
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Kelas</option>
                {uniqueClasses.map(className => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Siswa
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Export CSV
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Siswa</h3>
            <p className="text-3xl font-bold text-blue-600">{filteredStudents.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Sudah Daftar Event 1</h3>
            <p className="text-3xl font-bold text-green-600">
              {filteredStudents.filter(s => s.event_1_topic).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Sudah Daftar Event 2</h3>
            <p className="text-3xl font-bold text-purple-600">
              {filteredStudents.filter(s => s.event_2_topic).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Belum Lengkap</h3>
            <p className="text-3xl font-bold text-red-600">
              {filteredStudents.filter(s => !s.event_1_topic || !s.event_2_topic).length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                {filteredStudents.map((student, index) => (
                  <tr key={student.nis} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.nis}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.event_1_topic ? (
                        <div>
                          <div className="font-medium text-gray-900">{student.event_1_topic}</div>
                          <div className="text-gray-500">{student.event_1_speaker}</div>
                          <div className="text-xs text-gray-400">{student.event_1_location}</div>
                        </div>
                      ) : (
                        <span className="text-red-500">Belum daftar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.event_2_topic ? (
                        <div>
                          <div className="font-medium text-gray-900">{student.event_2_topic}</div>
                          <div className="text-gray-500">{student.event_2_speaker}</div>
                          <div className="text-xs text-gray-400">{student.event_2_location}</div>
                        </div>
                      ) : (
                        <span className="text-red-500">Belum daftar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.event_1_topic && student.event_2_topic ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Lengkap
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Belum Lengkap
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              Tidak ada data siswa yang ditemukan.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
