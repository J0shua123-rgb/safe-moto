import React, { useState } from 'react'
import { database } from '../lib/supabase'

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    plate_number: '',
    coverage_area: '',
    emergency_contact: '',
    photo_url: '',
    moto_photo_url: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validateGhanaPhone = (phone) => {
    const ghanaPhoneRegex = /^(\+233|0)[2-9][0-9]{8}$/
    return ghanaPhoneRegex.test(phone)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!validateGhanaPhone(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid Ghana phone number (+233XXXXXXXX or 0XXXXXXXX)'
    }
    
    if (!formData.plate_number.trim()) {
      newErrors.plate_number = 'Motorcycle plate number is required'
    }
    
    if (!formData.coverage_area.trim()) {
      newErrors.coverage_area = 'Coverage area is required'
    }
    
    if (!formData.emergency_contact.trim()) {
      newErrors.emergency_contact = 'Emergency contact is required'
    } else if (!validateGhanaPhone(formData.emergency_contact)) {
      newErrors.emergency_contact = 'Please enter a valid Ghana emergency contact number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const { data, error } = await database.insert('riders', {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim(),
        plate_number: formData.plate_number.trim(),
        coverage_area: formData.coverage_area.trim(),
        emergency_contact: formData.emergency_contact.trim(),
        photo_url: formData.photo_url,
        moto_photo_url: formData.moto_photo_url,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      
      if (error) {
        throw error
      }
      
      setShowSuccess(true)
      setFormData({
        full_name: '',
        phone_number: '',
        plate_number: '',
        coverage_area: '',
        emergency_contact: '',
        photo_url: '',
        moto_photo_url: ''
      })
      
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application submitted!</h2>
          <p className="text-gray-600 mb-6">You will be contacted once verified.</p>
          <button
            onClick={() => setShowSuccess(false)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join SafeMoto</h1>
            <p className="text-gray-600">Register as a motorcycle rider</p>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] ${
                  errors.full_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                aria-required="true"
                aria-invalid={errors.full_name ? 'true' : 'false'}
                aria-describedby={errors.full_name ? 'full_name-error' : undefined}
              />
              {errors.full_name && (
                <p id="full_name-error" className="mt-1 text-sm text-red-600">
                  {errors.full_name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] ${
                  errors.phone_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+233XXXXXXXX or 0XXXXXXXX"
                aria-required="true"
                aria-invalid={errors.phone_number ? 'true' : 'false'}
                aria-describedby={errors.phone_number ? 'phone_number-error' : undefined}
              />
              {errors.phone_number && (
                <p id="phone_number-error" className="mt-1 text-sm text-red-600">
                  {errors.phone_number}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="plate_number" className="block text-sm font-medium text-gray-700 mb-1">
                Motorcycle Plate Number *
              </label>
              <input
                type="text"
                id="plate_number"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] ${
                  errors.plate_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., GR 1234-20"
                aria-required="true"
                aria-invalid={errors.plate_number ? 'true' : 'false'}
                aria-describedby={errors.plate_number ? 'plate_number-error' : undefined}
              />
              {errors.plate_number && (
                <p id="plate_number-error" className="mt-1 text-sm text-red-600">
                  {errors.plate_number}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="coverage_area" className="block text-sm font-medium text-gray-700 mb-1">
                Area You Cover *
              </label>
              <input
                type="text"
                id="coverage_area"
                name="coverage_area"
                value={formData.coverage_area}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] ${
                  errors.coverage_area ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Accra Central, East Legon"
                aria-required="true"
                aria-invalid={errors.coverage_area ? 'true' : 'false'}
                aria-describedby={errors.coverage_area ? 'coverage_area-error' : undefined}
              />
              {errors.coverage_area && (
                <p id="coverage_area-error" className="mt-1 text-sm text-red-600">
                  {errors.coverage_area}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact *
              </label>
              <input
                type="tel"
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] ${
                  errors.emergency_contact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+233XXXXXXXX or 0XXXXXXXX"
                aria-required="true"
                aria-invalid={errors.emergency_contact ? 'true' : 'false'}
                aria-describedby={errors.emergency_contact ? 'emergency_contact-error' : undefined}
              />
              {errors.emergency_contact && (
                <p id="emergency_contact-error" className="mt-1 text-sm text-red-600">
                  {errors.emergency_contact}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="profile_photo" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo
              </label>
              <input
                type="file"
                id="profile_photo"
                accept="image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">Photo upload coming soon</p>
            </div>

            <div>
              <label htmlFor="motorcycle_photo" className="block text-sm font-medium text-gray-700 mb-1">
                Motorcycle Photo
              </label>
              <input
                type="file"
                id="motorcycle_photo"
                accept="image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">Photo upload coming soon</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already registered?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
