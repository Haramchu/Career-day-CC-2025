import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import CareerDayService from '../lib/careerDayService'

const DatabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing...')
  const [tables, setTables] = useState([])
  const [testResults, setTestResults] = useState({})

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('students')
        .select('count', { count: 'exact', head: true })

      if (error) {
        setConnectionStatus(`Connection Error: ${error.message}`)
      } else {
        setConnectionStatus('Connected successfully!')
        await loadTableInfo()
      }
    } catch (error) {
      setConnectionStatus(`Error: ${error.message}`)
    }
  }

  const loadTableInfo = async () => {
    const tableNames = ['students', 'speakers', 'locations', 'talks', 'enrollments']
    const tableInfo = []

    for (const tableName of tableNames) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        tableInfo.push({
          name: tableName,
          count: error ? 'Error' : count,
          status: error ? 'Error' : 'OK',
          error: error?.message
        })
      } catch (err) {
        tableInfo.push({
          name: tableName,
          count: 'Error',
          status: 'Error',
          error: err.message
        })
      }
    }

    setTables(tableInfo)
  }

  const testEnrollmentFlow = async () => {
    const results = {}

    try {
      // Test 1: Get all talks
      results.getAllTalks = await CareerDayService.getAllTalks()
      
      // Test 2: Get talks by session
      results.getSession1Talks = await CareerDayService.getTalksBySession(1)
      results.getSession2Talks = await CareerDayService.getTalksBySession(2)
      
      // Test 3: Validate student (test dengan NIS yang ada)
      results.validateStudent = await CareerDayService.validateStudent('2024001001')
      
      // Test 4: Get enrollment stats
      results.enrollmentStats = await CareerDayService.getEnrollmentStats()

      setTestResults(results)
    } catch (error) {
      setTestResults({ error: error.message })
    }
  }

  const createSampleData = async () => {
    try {
      // Create sample student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          nis: '2024001001',
          name: 'Test Student',
          class: '12 IPA 1'
        })
        .select()

      if (studentError && !studentError.message.includes('duplicate')) {
        throw studentError
      }

      // Create sample speaker
      const { data: speaker, error: speakerError } = await supabase
        .from('speakers')
        .insert({
          name: 'Dr. Test',
          bio: 'Test speaker',
          profession: 'Doctor',
          company: 'Test Hospital'
        })
        .select()

      if (speakerError && !speakerError.message.includes('duplicate')) {
        throw speakerError
      }

      // Create sample location
      const { data: location, error: locationError } = await supabase
        .from('locations')
        .insert({
          name: 'Test Hall',
          capacity: 100,
          type: 'hall'
        })
        .select()

      if (locationError && !locationError.message.includes('duplicate')) {
        throw locationError
      }

      alert('Sample data created successfully!')
      await loadTableInfo()
    } catch (error) {
      alert(`Error creating sample data: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <p className={`font-medium ${connectionStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {connectionStatus}
        </p>
      </div>

      {/* Tables Info */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Tables Information</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Table</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Record Count</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Error</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.name}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{table.name}</td>
                  <td className={`border border-gray-300 px-4 py-2 ${
                    table.status === 'OK' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {table.status}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{table.count}</td>
                  <td className="border border-gray-300 px-4 py-2 text-red-600 text-sm">
                    {table.error || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 space-x-4">
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
        <button 
          onClick={testEnrollmentFlow}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Enrollment Logic
        </button>
        <button 
          onClick={createSampleData}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Create Sample Data
        </button>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default DatabaseTest
