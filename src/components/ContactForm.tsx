import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  organization: string;
  topic: string;
  message: string;
  hp?: string; // Honeypot
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    topic: '',
    message: '',
    hp: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple honeypot spam protection
    if (formData.hp) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    // Basic validation
    if (!formData.name || !formData.email || !formData.topic || !formData.message) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('submitting');

    // TODO: replace with real API call / serverless function / form service
    // For now we log and simulate success
    // console.log('Form Data Submitted:', formData);

    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', organization: '', topic: '', message: '', hp: '' });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1200);
  };

  const isSubmitting = status === 'submitting';

  return (
    <div className="relative max-w-2xl mx-auto transition-colors duration-300">
      {/* <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Us</h3>
      </div> */}

      {/* Status messages */}
      <div aria-live="polite" className="min-h-[2rem] mb-4">
        {isSubmitting && (
          <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-800 dark:border-blue-700 rounded-r-xl">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800 dark:border-blue-700 mr-3" />
            <p className="text-blue-800 dark:text-blue-300 font-semibold">Sending your message...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-xl">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <p className="text-green-700 dark:text-green-300 font-bold">Message sent successfully!</p>
                <p className="text-green-600 dark:text-green-400 text-sm">We'll be in touch shortly.</p>
              </div>
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="text-red-700 dark:text-red-300 font-bold">Please fill in all required fields.</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Honeypot */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <label>Leave this field empty</label>
          <input name="hp" value={formData.hp} onChange={handleChange} />
        </div>

        <div className="relative">
          <input
            type="text"
            name="name"
            id="name"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-all outline-none placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Full Name *"
          />
        </div>

        <div className="relative">
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-all outline-none placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Email *"
          />
        </div>

        <div className="relative">
          <input
            type="text"
            name="organization"
            id="organization"
            value={formData.organization}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-all outline-none placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Organization / Facility Name"
          />
        </div>

        <div className="relative">
          <select
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Select Reason for contact *
            </option>
            <option>Afrodoctor Mobile Application (Patients / Caregivers)</option>
            <option>Afrodoctor Hospital Management System (HMS)</option>
            <option>Strategic Partnership / Collaboration</option>
            <option>The Immersed – Project Capacity Building</option>
            <option>General Inquiry</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-all outline-none resize-y placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Your Message *"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 text-lg font-bold rounded-xl transition-all duration-300 flex items-center justify-center ${
            isSubmitting
              ? 'bg-blue-300 dark:bg-blue-900 text-white cursor-not-allowed opacity-80'
              : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white hover:shadow-lg hover:scale-[1.01]'
          }`}
        >
          {isSubmitting ? 'Sending...' : 'Send Inquiry'}
          {!isSubmitting && <span className="ml-2">→</span>}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;