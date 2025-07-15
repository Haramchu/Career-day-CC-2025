import React, { createContext, useContext } from 'react'
import { useCareerDay } from '../hooks/useCareerDay'

// Context untuk Career Day
const CareerDayContext = createContext()

// Provider component
export const CareerDayProvider = ({ children }) => {
  const careerDayHook = useCareerDay()
  
  return (
    <CareerDayContext.Provider value={careerDayHook}>
      {children}
    </CareerDayContext.Provider>
  )
}

// Hook untuk menggunakan context
export const useCareerDayContext = () => {
  const context = useContext(CareerDayContext)
  
  if (!context) {
    throw new Error('useCareerDayContext must be used within a CareerDayProvider')
  }
  
  return context
}

export default CareerDayContext
