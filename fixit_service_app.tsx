import React, { useState } from 'react';
import { Wrench, Droplet, Car, Hammer, Zap, Wind, User, Calendar, MapPin, Phone, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const App = () => {
  const [userType, setUserType] = useState('customer');
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState([
    { id: 1, customer: 'John Doe', service: 'Plumbing', issue: 'Leaking faucet', status: 'pending', location: '123 Main St', phone: '555-0101', date: '2025-09-30', time: '10:00 AM' },
    { id: 2, customer: 'Jane Smith', service: 'Appliance Repair', issue: 'Refrigerator not cooling', status: 'accepted', location: '456 Oak Ave', phone: '555-0102', date: '2025-09-30', time: '2:00 PM', technician: 'Mike Wilson' },
    { id: 3, customer: 'Bob Johnson', service: 'Electrical', issue: 'Circuit breaker tripping', status: 'completed', location: '789 Pine Rd', phone: '555-0103', date: '2025-09-29', time: '11:00 AM', technician: 'Sarah Lee' }
  ]);
  
  const [newRequest, setNewRequest] = useState({
    service: '',
    issue: '',
    location: '',
    phone: '',
    date: '',
    time: ''
  });

  const services = [
    { name: 'Appliance Repair', icon: Wrench, color: 'bg-blue-500' },
    { name: 'Plumbing', icon: Droplet, color: 'bg-cyan-500' },
    { name: 'Mechanic', icon: Car, color: 'bg-red-500' },
    { name: 'Carpenter', icon: Hammer, color: 'bg-amber-500' },
    { name: 'Electrical', icon: Zap, color: 'bg-yellow-500' },
    { name: 'HVAC', icon: Wind, color: 'bg-purple-500' }
  ];

  const handleSubmitRequest = () => {
    if (!newRequest.service || !newRequest.issue || !newRequest.location || !newRequest.phone || !newRequest.date || !newRequest.time) {
      alert('Please fill in all fields');
      return;
    }
    
    const request = {
      id: requests.length + 1,
      customer: 'Current User',
      service: newRequest.service,
      issue: newRequest.issue,
      status: 'pending',
      location: newRequest.location,
      phone: newRequest.phone,
      date: newRequest.date,
      time: newRequest.time
    };
    setRequests([request, ...requests]);
    setNewRequest({ service: '', issue: '', location: '', phone: '', date: '', time: '' });
    setActiveTab('requests');
  };

  const handleStatusChange = (id, newStatus) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: newStatus, technician: newStatus === 'accepted' ? 'Current Technician' : req.technician } : req
    ));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = userType === 'customer' 
    ? requests.filter(r => r.customer === 'Current User')
    : requests;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wrench className="w-8 h-8" />
              <h1 className="text-3xl font-bold">FixIt</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={userType}
                onChange={(e) => {
                  setUserType(e.target.value);
                  setActiveTab('home');
                }}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium"
              >
                <option value="customer">Customer</option>
                <option value="technician">Technician</option>
              </select>
              <User className="w-6 h-6" />
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'home' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {userType === 'customer' ? 'My Requests' : 'Service Requests'}
            </button>
            {userType === 'customer' && (
              <button
                onClick={() => setActiveTab('new')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'new' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                New Request
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {userType === 'customer' ? 'Available Services' : 'Technician Dashboard'}
            </h2>
            
            {userType === 'customer' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div
                    key={service.name}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                      setNewRequest({ ...newRequest, service: service.name });
                      setActiveTab('new');
                    }}
                  >
                    <div className={`${service.color} h-32 flex items-center justify-center`}>
                      <service.icon className="w-16 h-16 text-white" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800">{service.name}</h3>
                      <p className="text-gray-600 mt-2">Professional {service.name.toLowerCase()} services</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600 mt-1">
                        {filteredRequests.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <AlertCircle className="w-12 h-12 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Active</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {filteredRequests.filter(r => r.status === 'accepted').length}
                      </p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Completed</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {filteredRequests.filter(r => r.status === 'completed').length}
                      </p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {userType === 'customer' ? 'My Service Requests' : 'Available Service Requests'}
            </h2>
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span className="text-blue-600 font-semibold">{request.service}</span>
                      </div>
                      
                      {userType === 'technician' && (
                        <p className="text-gray-800 font-medium mb-2">Customer: {request.customer}</p>
                      )}
                      
                      <p className="text-gray-700 mb-3"><span className="font-medium">Issue:</span> {request.issue}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{request.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{request.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{request.time}</span>
                        </div>
                      </div>
                      
                      {request.technician && (
                        <p className="text-green-600 font-medium mt-3">Assigned to: {request.technician}</p>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {getStatusIcon(request.status)}
                    </div>
                  </div>
                  
                  {userType === 'technician' && request.status === 'pending' && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleStatusChange(request.id, 'accepted')}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Accept Job
                      </button>
                      <button
                        onClick={() => handleStatusChange(request.id, 'cancelled')}
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  
                  {userType === 'technician' && request.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(request.id, 'completed')}
                      className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
              
              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No service requests found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'new' && userType === 'customer' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Request a Service</h2>
            <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Service Type</label>
                  <select
                    value={newRequest.service}
                    onChange={(e) => setNewRequest({ ...newRequest, service: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    {services.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Describe the Issue</label>
                  <textarea
                    value={newRequest.issue}
                    onChange={(e) => setNewRequest({ ...newRequest, issue: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Please describe what needs to be fixed..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={newRequest.location}
                    onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your address"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newRequest.phone}
                    onChange={(e) => setNewRequest({ ...newRequest, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="555-0123"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Preferred Date</label>
                    <input
                      type="date"
                      value={newRequest.date}
                      onChange={(e) => setNewRequest({ ...newRequest, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Preferred Time</label>
                    <input
                      type="time"
                      value={newRequest.time}
                      onChange={(e) => setNewRequest({ ...newRequest, time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSubmitRequest}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;