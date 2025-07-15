import { useState, useEffect, useCallback } from 'react'
import CareerDayService from '../lib/careerDayService'

// Custom hook untuk menangani enrollment logic
export const useCareerDay = () => {
  const [student, setStudent] = useState(null)
  const [talks, setTalks] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Validasi dan login siswa
  const loginStudent = useCallback(async (nis) => {
    setLoading(true)
    setError(null)
    
    try {
      // Validasi format NIS
      if (!CareerDayService.validateNISFormat(nis)) {
        throw new Error('Format NIS tidak valid. NIS harus berupa 8-10 digit angka.')
      }

      const { data, error } = await CareerDayService.validateStudent(nis)
      
      if (error || !data) {
        throw new Error('NIS tidak ditemukan. Pastikan NIS Anda benar.')
      }
      
      setStudent(data)
      
      // Load enrollments siswa
      await loadStudentEnrollments(data.id)
      
      return { success: true, student: data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load semua talks
  const loadTalks = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await CareerDayService.getAllTalks()
      
      if (error) throw error
      
      setTalks(data)
      return { success: true, talks: data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load talks berdasarkan sesi
  const loadTalksBySession = useCallback(async (session) => {
    setLoading(true)
    try {
      const { data, error } = await CareerDayService.getTalksBySession(session)
      
      if (error) throw error
      
      return { success: true, talks: data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load enrollments siswa
  const loadStudentEnrollments = useCallback(async (studentId) => {
    try {
      const { data, error } = await CareerDayService.getStudentEnrollments(studentId)
      
      if (error) throw error
      
      setEnrollments(data || [])
      return { success: true, enrollments: data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  // Enroll siswa ke kelas
  const enrollToTalk = useCallback(async (talkId) => {
    if (!student) {
      setError('Silakan login terlebih dahulu')
      return { success: false, error: 'Silakan login terlebih dahulu' }
    }

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await CareerDayService.enrollStudent(student.id, talkId)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Refresh enrollments dan talks
      await loadStudentEnrollments(student.id)
      await loadTalks()
      
      return { success: true, enrollment: data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [student, loadStudentEnrollments, loadTalks])

  // Hapus enrollment dari kelas
  const unenrollFromTalk = useCallback(async (talkId) => {
    if (!student) {
      setError('Silakan login terlebih dahulu')
      return { success: false, error: 'Silakan login terlebih dahulu' }
    }

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await CareerDayService.unenrollStudent(student.id, talkId)
      
      if (error) throw error
      
      // Refresh enrollments dan talks
      await loadStudentEnrollments(student.id)
      await loadTalks()
      
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [student, loadStudentEnrollments, loadTalks])

  // Ganti pilihan kelas
  const changeEnrollment = useCallback(async (oldTalkId, newTalkId) => {
    if (!student) {
      setError('Silakan login terlebih dahulu')
      return { success: false, error: 'Silakan login terlebih dahulu' }
    }

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await CareerDayService.changeEnrollment(student.id, oldTalkId, newTalkId)
      
      if (error) throw error
      
      // Refresh enrollments dan talks
      await loadStudentEnrollments(student.id)
      await loadTalks()
      
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [student, loadStudentEnrollments, loadTalks])

  // Helper functions
  const getTalksBySession = useCallback((session) => {
    return talks.filter(talk => talk.session === session)
  }, [talks])

  const getEnrollmentBySession = useCallback((session) => {
    return enrollments.find(enrollment => enrollment.talks?.session === session)
  }, [enrollments])

  const hasEnrolledInSession = useCallback((session) => {
    return enrollments.some(enrollment => enrollment.talks?.session === session)
  }, [enrollments])

  const getAvailableTalksInSession = useCallback((session) => {
    return talks.filter(talk => talk.session === session && !talk.is_full)
  }, [talks])

  const isStudentEnrolledInTalk = useCallback((talkId) => {
    return enrollments.some(enrollment => enrollment.talk_id === talkId)
  }, [enrollments])

  // Logout siswa
  const logout = useCallback(() => {
    setStudent(null)
    setEnrollments([])
    setTalks([])
    setError(null)
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    student,
    talks,
    enrollments,
    loading,
    error,
    
    // Actions
    loginStudent,
    logout,
    loadTalks,
    loadTalksBySession,
    loadStudentEnrollments,
    enrollToTalk,
    unenrollFromTalk,
    changeEnrollment,
    clearError,
    
    // Helper functions
    getTalksBySession,
    getEnrollmentBySession,
    hasEnrolledInSession,
    getAvailableTalksInSession,
    isStudentEnrolledInTalk
  }
}

// Hook untuk statistik admin
export const useEnrollmentStats = () => {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await CareerDayService.getEnrollmentStats()
      
      if (error) throw error
      
      setStats(data)
      return { success: true, stats: data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    loading,
    error,
    loadStats
  }
}
