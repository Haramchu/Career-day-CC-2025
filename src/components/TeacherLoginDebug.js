import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const TeacherLoginDebug = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [testResults, setTestResults] = useState({});

  const testDatabaseConnection = async () => {
    setDebugInfo('Testing database connection...\n');
    let results = {};

    try {
      // Test 1: Basic connection
      setDebugInfo(prev => prev + '1. Testing basic connection...\n');
      const { data: basicTest, error: basicError } = await supabase
        .from('students')
        .select('count')
        .limit(1);
      
      if (basicError) {
        results.basicConnection = `Failed: ${basicError.message}`;
        setDebugInfo(prev => prev + `   Error: ${basicError.message}\n`);
      } else {
        results.basicConnection = 'Success';
        setDebugInfo(prev => prev + '   Success!\n');
      }

      // Test 2: Check if teachers table exists
      setDebugInfo(prev => prev + '2. Checking teachers table...\n');
      const { data: teachersTest, error: teachersError } = await supabase
        .from('teachers')
        .select('count')
        .limit(1);
      
      if (teachersError) {
        results.teachersTable = `Failed: ${teachersError.message}`;
        setDebugInfo(prev => prev + `   Error: ${teachersError.message}\n`);
      } else {
        results.teachersTable = 'Success';
        setDebugInfo(prev => prev + '   Teachers table exists!\n');
      }

      // Test 3: Check if teacher_login function exists
      setDebugInfo(prev => prev + '3. Testing teacher_login function...\n');
      const { data: rpcTest, error: rpcError } = await supabase
        .rpc('teacher_login', {
          teacher_email: 'test@test.com',
          teacher_password: 'test'
        });
      
      if (rpcError) {
        results.rpcFunction = `Failed: ${rpcError.message}`;
        setDebugInfo(prev => prev + `   Error: ${rpcError.message}\n`);
      } else {
        results.rpcFunction = 'Success (function exists)';
        setDebugInfo(prev => prev + '   Function exists!\n');
      }

      // Test 4: Check actual teacher data
      setDebugInfo(prev => prev + '4. Checking teacher data...\n');
      const { data: teacherData, error: dataError } = await supabase
        .from('teachers')
        .select('*')
        .limit(5);
      
      if (dataError) {
        results.teacherData = `Failed: ${dataError.message}`;
        setDebugInfo(prev => prev + `   Error: ${dataError.message}\n`);
      } else {
        results.teacherData = `Found ${teacherData?.length || 0} teachers`;
        setDebugInfo(prev => prev + `   Found ${teacherData?.length || 0} teacher records\n`);
        if (teacherData && teacherData.length > 0) {
          setDebugInfo(prev => prev + `   Sample teacher: ${teacherData[0].email}\n`);
        }
      }

      // Test 5: Try actual login with sample data
      setDebugInfo(prev => prev + '5. Testing login with sample credentials...\n');
      const { data: loginTest, error: loginError } = await supabase
        .rpc('teacher_login', {
          teacher_email: 'budi.santoso@sekolah.sch.id',
          teacher_password: 'password123'
        });
      
      if (loginError) {
        results.sampleLogin = `Failed: ${loginError.message}`;
        setDebugInfo(prev => prev + `   Error: ${loginError.message}\n`);
      } else {
        const response = typeof loginTest === 'string' ? JSON.parse(loginTest) : loginTest;
        results.sampleLogin = response.success ? 'Success' : `Failed: ${response.error}`;
        setDebugInfo(prev => prev + `   Result: ${JSON.stringify(response, null, 2)}\n`);
      }

    } catch (error) {
      setDebugInfo(prev => prev + `\nFatal error: ${error.message}\n`);
      results.fatalError = error.message;
    }

    setTestResults(results);
    setDebugInfo(prev => prev + '\n=== Test Complete ===\n');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Teacher Login Debug Tool</h2>
      
      <button
        onClick={testDatabaseConnection}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-4"
      >
        Run Database Tests
      </button>

      {debugInfo && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Debug Output:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm whitespace-pre-wrap">
            {debugInfo}
          </pre>
        </div>
      )}

      {Object.keys(testResults).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Test Results Summary:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(testResults).map(([test, result]) => (
              <div
                key={test}
                className={`p-3 rounded-md border ${
                  result.includes('Success') || result.includes('Found')
                    ? 'bg-green-100 border-green-300'
                    : 'bg-red-100 border-red-300'
                }`}
              >
                <div className="font-medium capitalize">{test.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-sm">{result}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-md">
        <h4 className="font-semibold text-yellow-800">Quick Setup Instructions:</h4>
        <ol className="text-sm text-yellow-700 mt-2 space-y-1">
          <li>1. Make sure your .env file has REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY</li>
          <li>2. Run the database setup scripts in order:
            <ul className="ml-4 mt-1">
              <li>• database/schema.sql</li>
              <li>• database/teacher_admin_setup.sql</li>
              <li>• database/sample_data.sql</li>
            </ul>
          </li>
          <li>3. Verify the teacher_login function exists in Supabase Functions</li>
          <li>4. Test login with: budi.santoso@sekolah.sch.id / password123</li>
        </ol>
      </div>
    </div>
  );
};

export default TeacherLoginDebug;
