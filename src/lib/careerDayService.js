import { supabase } from './supabase'

// Service untuk menangani enrollment Career Day
export class CareerDayService {
  
  // Validasi siswa berdasarkan NIS
  static async validateStudent(nis) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('nis', nis)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Mendapatkan semua talks/kelas yang tersedia
  static async getAllTalks() {
    try {
      const { data, error } = await supabase
        .from('talks')
        .select(`
          *,
          speakers (
            id,
            name,
            photo_url,
            bio
          ),
          locations (
            id,
            name,
            capacity
          ),
          enrollments (
            id,
            student_id
          )
        `)
        .order('session', { ascending: true })
        .order('topic', { ascending: true })
      
      if (error) throw error

      // Hitung current enrollment untuk setiap talk
      const talksWithEnrollmentCount = data.map(talk => ({
        ...talk,
        current_enrollment: talk.enrollments?.length || 0,
        available_slots: talk.locations.capacity - (talk.enrollments?.length || 0),
        is_full: (talk.enrollments?.length || 0) >= talk.locations.capacity
      }))
      
      return { data: talksWithEnrollmentCount, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Mendapatkan talks berdasarkan sesi
  static async getTalksBySession(session) {
    try {
      const { data, error } = await supabase
        .from('talks')
        .select(`
          *,
          speakers (
            id,
            name,
            photo_url,
            bio
          ),
          locations (
            id,
            name,
            capacity
          ),
          enrollments (
            id,
            student_id
          )
        `)
        .eq('session', session)
        .order('topic', { ascending: true })
      
      if (error) throw error

      // Hitung current enrollment untuk setiap talk
      const talksWithEnrollmentCount = data.map(talk => ({
        ...talk,
        current_enrollment: talk.enrollments?.length || 0,
        available_slots: talk.locations.capacity - (talk.enrollments?.length || 0),
        is_full: (talk.enrollments?.length || 0) >= talk.locations.capacity
      }))
      
      return { data: talksWithEnrollmentCount, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Cek enrollment siswa saat ini
  static async getStudentEnrollments(studentId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          talks (
            id,
            session,
            topic,
            description,
            speakers (
              name,
              photo_url
            ),
            locations (
              name,
              capacity
            )
          )
        `)
        .eq('student_id', studentId)
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Validasi apakah siswa sudah memilih kelas di sesi tertentu
  static async hasStudentChosenSession(studentId, session) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          talks!inner (
            session
          )
        `)
        .eq('student_id', studentId)
        .eq('talks.session', session)
      
      if (error) throw error
      
      return { hasChosen: data && data.length > 0, enrollment: data?.[0] || null }
    } catch (error) {
      return { hasChosen: false, enrollment: null, error }
    }
  }

  // Enroll siswa ke kelas
  static async enrollStudent(studentId, talkId) {
    try {
      // 1. Cek apakah talk masih tersedia
      const { data: talk, error: talkError } = await supabase
        .from('talks')
        .select(`
          *,
          locations (capacity),
          enrollments (id)
        `)
        .eq('id', talkId)
        .single()
      
      if (talkError) throw talkError
      
      const currentEnrollment = talk.enrollments?.length || 0
      if (currentEnrollment >= talk.locations.capacity) {
        return { 
          data: null, 
          error: { message: 'Kelas sudah penuh. Silakan pilih kelas lain.' } 
        }
      }

      // 2. Cek apakah siswa sudah memilih kelas di sesi yang sama
      const { hasChosen, enrollment: existingEnrollment } = await this.hasStudentChosenSession(studentId, talk.session)
      
      if (hasChosen) {
        return { 
          data: null, 
          error: { 
            message: `Anda sudah memilih kelas di sesi ${talk.session}. Silakan hapus pilihan sebelumnya terlebih dahulu.`,
            type: 'ALREADY_ENROLLED_IN_SESSION'
          } 
        }
      }

      // 3. Enroll siswa
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: studentId,
          talk_id: talkId,
          enrolled_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Hapus enrollment siswa dari kelas
  static async unenrollStudent(studentId, talkId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .delete()
        .eq('student_id', studentId)
        .eq('talk_id', talkId)
        .select()
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Ganti pilihan kelas (hapus lama, pilih baru)
  static async changeEnrollment(studentId, oldTalkId, newTalkId) {
    try {
      // Gunakan transaction untuk memastikan konsistensi
      const { data, error } = await supabase.rpc('change_enrollment', {
        p_student_id: studentId,
        p_old_talk_id: oldTalkId,
        p_new_talk_id: newTalkId
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      // Fallback jika stored procedure belum ada
      console.log('Stored procedure not found, using manual transaction')
      
      // Manual transaction simulation
      try {
        // 1. Hapus enrollment lama
        await this.unenrollStudent(studentId, oldTalkId)
        
        // 2. Enroll ke kelas baru
        const result = await this.enrollStudent(studentId, newTalkId)
        
        return result
      } catch (fallbackError) {
        return { data: null, error: fallbackError }
      }
    }
  }

  // Mendapatkan statistik enrollment
  static async getEnrollmentStats() {
    try {
      const { data, error } = await supabase
        .from('talks')
        .select(`
          id,
          topic,
          session,
          locations (
            name,
            capacity
          ),
          enrollments (
            id
          )
        `)
      
      if (error) throw error
      
      const stats = data.map(talk => ({
        talk_id: talk.id,
        topic: talk.topic,
        session: talk.session,
        location: talk.locations.name,
        capacity: talk.locations.capacity,
        enrolled: talk.enrollments?.length || 0,
        available: talk.locations.capacity - (talk.enrollments?.length || 0),
        percentage_full: Math.round(((talk.enrollments?.length || 0) / talk.locations.capacity) * 100)
      }))
      
      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Helper function untuk validasi NIS format
  static validateNISFormat(nis) {
    // Asumsi NIS adalah angka dengan panjang tertentu
    // Sesuaikan dengan format NIS sekolah Anda
    const nisPattern = /^\d{8,10}$/; // 8-10 digit angka
    return nisPattern.test(nis)
  }
}

export default CareerDayService
