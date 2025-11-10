import React, { useState } from 'react';

interface FormData {
    name: string;
    email: string;
    organization: string;
    topic: string;
    message: string;
    hp?: string;
}

const ContactForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        organization: '',
        topic: 'Afrodoctor Hospital Management System (HMS)',
        message: '',
        hp: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
       
        if (formData.hp) {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
            return;
        }

        setStatus('submitting');

        if (!formData.name || !formData.email || !formData.message) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        console.log('Form Data Submitted:', {
            name: formData.name,
            email: formData.email,
            organization: formData.organization,
            topic: formData.topic,
            message: formData.message,
        });

        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', organization: '', topic: 'Afrodoctor Hospital Management System (HMS)', message: '', hp: '' });
            setTimeout(() => setStatus('idle'), 5000);
        }, 1200);
    };

    return (
        <div className="relative max-w-2xl p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            {/* Solid blue accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-800 dark:bg-blue-700"></div>
           
            <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">✉️</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Inquire About Our Solutions</h3>
            </div>

            {/* Status messages with better styling */}
            <div aria-live="polite" className="min-h-[3rem] mb-6">
                {status === 'submitting' && (
                    <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-800 dark:border-blue-700 rounded-r-xl animate-fade-in">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800 dark:border-blue-700 mr-3"></div>
                        <p className="text-blue-800 dark:text-blue-300 font-semibold">Sending your message...</p>
                    </div>
                )}
                {status === 'success' && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-xl animate-fade-in">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">✓</span>
                            <div>
                                <p className="text-green-700 dark:text-green-300 font-bold">Message sent successfully!</p>
                                <p className="text-green-600 dark:text-green-400 text-sm">We'll be in touch shortly.</p>
                            </div>
                        </div>
                    </div>
                )}
                {status === 'error' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl animate-fade-in">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">⚠️</span>
                            <p className="text-red-700 dark:text-red-300 font-bold">Please fill in all required fields.</p>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Honeypot */}
                <div style={{display: 'none'}} aria-hidden="true">
                    <label>Leave this field empty</label>
                    <input name="hp" value={formData.hp} onChange={handleChange} />
                </div>

                {/* Name field with floating label effect */}
                <div className="relative">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="peer w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-800 dark:focus:border-blue-700 focus:ring-4 focus:ring-blue-800/10 dark:focus:ring-blue-700/10 transition-all duration-300 outline-none"
                        placeholder="Full Name *"
                        aria-required="true"
                    />
                    {/* Single blue overlay */}
                    {focusedField === 'name' && (
                        <div className="absolute inset-0 rounded-xl bg-blue-800/10 dark:bg-blue-700/20 pointer-events-none"></div>
                    )}
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
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="peer w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-800 dark:focus:border-blue-700 focus:ring-4 focus:ring-blue-800/10 dark:focus:ring-blue-700/10 transition-all duration-300 outline-none"
                        placeholder="Work Email *"
                        aria-required="true"
                    />
                    {/* Single blue overlay */}
                    {focusedField === 'email' && (
                        <div className="absolute inset-0 rounded-xl bg-blue-800/10 dark:bg-blue-700/20 pointer-events-none"></div>
                    )}
                </div>

                <div className="relative">
                    <input
                        type="text"
                        name="organization"
                        id="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('organization')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-800 dark:focus:border-blue-700 focus:ring-4 focus:ring-blue-800/10 dark:focus:ring-blue-700/10 transition-all duration-300 outline-none"
                        placeholder="Organization / Facility Name"
                    />
                    {/* Single blue overlay */}
                    {focusedField === 'organization' && (
                        <div className="absolute inset-0 rounded-xl bg-blue-800/10 dark:bg-blue-700/20 pointer-events-none"></div>
                    )}
                </div>

                <div className="relative">
                    <select
                        id="topic"
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('topic')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-800 dark:focus:border-blue-700 focus:ring-4 focus:ring-blue-800/10 dark:focus:ring-blue-700/10 transition-all duration-300 outline-none appearance-none cursor-pointer"
                    >
                        <option>Afrodoctor Hospital Management System (HMS)</option>
                        <option>Strategic Partnership / Collaboration</option>
                        <option>The Immersed – Project Capacity Building</option>
                        <option>General Inquiry</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                    {/* Single blue overlay */}
                    {focusedField === 'topic' && (
                        <div className="absolute inset-0 rounded-xl bg-blue-800/10 dark:bg-blue-700/20 pointer-events-none"></div>
                    )}
                </div>
               
                <div className="relative">
                    <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-800 dark:focus:border-blue-700 focus:ring-4 focus:ring-blue-800/10 dark:focus:ring-blue-700/10 transition-all duration-300 outline-none resize-none"
                        placeholder="Your Message *"
                        aria-required="true"
                    ></textarea>
                    {/* Single blue overlay */}
                    {focusedField === 'message' && (
                        <div className="absolute inset-0 rounded-xl bg-blue-800/10 dark:bg-blue-700/20 pointer-events-none"></div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="px-6 py-3 bg-blue-800 hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group relative w-full py-4 px-8 border-0 rounded-xl text-lg font-bold overflow-hidden transition-colors duration-300"
                >
                    <span className="relative z-10 flex items-center justify-center">
                        {status === 'submitting' ? 'Sending...' : 'Send Inquiry'}
                        {status === 'idle' && (
                            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        )}
                    </span>
                    {/* Solid dark blue-900 on hover */}
                    <div className="absolute inset-0 bg-blue-900 dark:bg-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
            </form>
        </div>
    );
};

export default ContactForm;