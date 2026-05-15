import React, { useState, useEffect } from 'react'
import { database, realtime, supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const PassengerHome = () => {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchRiders()
    
    // Subscribe to realtime changes
    const subscription = realtime.subscribe('riders', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        fetchRiders()
      } else if (payload.eventType === 'DELETE') {
        setRiders(prev => prev.filter(rider => rider.id !== payload.old.id))
      }
    })

    return () => {
      realtime.unsubscribe(subscription)
    }
  }, [])

  const fetchRiders = async () => {
    try {
      const { data, error } = await supabase
        .from('riders')
        .select('*')
        .eq('verified', true)
        .neq('status', 'banned')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRiders(data || [])
    } catch (error) {
      console.error('Error fetching riders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatPhoneNumber = (phone) => {
    if (phone.startsWith('+233')) {
      return phone.replace('+233', '0')
    }
    return phone
  }

  const getWhatsAppUrl = (phone) => {
    const formattedPhone = phone.startsWith('+233') ? phone : phone.replace(/^0/, '+233')
    return `https://wa.me/${formattedPhone}`
  }

  const filteredRiders = riders.filter(rider => {
    const matchesSearch = 
      rider.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rider.plate_number?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && rider.status === 'active') ||
      (filter === 'on_trip' && rider.status === 'on_trip')

    return matchesSearch && matchesFilter
  })

  const RiderCard = ({ rider }) => {
    const isOnTrip = rider.status === 'on_trip'
    const initials = getInitials(rider.full_name || 'Rider')

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-3">
        <div className="flex items-start gap-3">
          {/* Rider Photo or Initials */}
          <div className="flex-shrink-0">
            {rider.photo_url ? (
              <img
                src={rider.photo_url}
                alt={rider.full_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {initials}
              </div>
            )}
          </div>

          {/* Rider Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {rider.full_name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isOnTrip 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isOnTrip ? 'On Trip' : 'Active'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Plate:</span> {rider.plate_number}
            </p>
            
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Area:</span> {rider.coverage_area}
            </p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">{rider.rating || '4.5'}</span>
              </div>
              <div className="text-gray-600">
                {rider.trip_count || 0} trips
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <a
            href={`tel:${rider.phone_number}`}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm min-h-[44px] ${
              isOnTrip
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            onClick={(e) => isOnTrip && e.preventDefault()}
            aria-disabled={isOnTrip}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </a>

          <a
            href={getWhatsAppUrl(rider.phone_number)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm min-h-[44px] ${
              isOnTrip
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            onClick={(e) => isOnTrip && e.preventDefault()}
            aria-disabled={isOnTrip}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>

          <button
            onClick={() => navigate(`/rider/${rider.id}`)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            View Profile
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading riders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <div className="bg-blue-600 text-white px-4 py-4 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">SafeMoto</h1>
            <p className="text-sm text-blue-100">Madina</p>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by name or plate number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-4">
          {['all', 'active', 'on_trip'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-full font-medium text-sm min-h-[44px] ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filterOption === 'all' ? 'All' : filterOption === 'active' ? 'Active' : 'On Trip'}
            </button>
          ))}
        </div>

        {/* Riders List */}
        {filteredRiders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No active riders right now</p>
          </div>
        ) : (
          <div>
            {filteredRiders.map(rider => (
              <RiderCard key={rider.id} rider={rider} />
            ))}
          </div>
        )}

        {/* Report Button */}
        <button className="w-full mt-6 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors min-h-[44px]">
          Report an Issue
        </button>
      </div>
    </div>
  )
}

export default PassengerHome
