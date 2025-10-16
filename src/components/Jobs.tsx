import { useState } from 'react';
import { Briefcase, Clock, MapPin, DollarSign, Upload } from 'lucide-react';

export default function Jobs() {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    coverLetter: '',
    availability: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const jobOpenings = [
    {
      title: 'Professional Chauffeur',
      location: 'Premium City, ST',
      type: 'Full-Time',
      salary: '$45,000 - $65,000',
      description: 'We are seeking experienced, professional chauffeurs to join our elite team. Must have a clean driving record and excellent customer service skills.',
      requirements: [
        'Valid driver\'s license with clean record (5+ years)',
        'Professional appearance and demeanor',
        'Excellent knowledge of local area',
        'Flexible schedule including evenings and weekends',
        'Previous luxury chauffeur experience preferred',
        'Background check and drug screening required'
      ]
    },
    {
      title: 'Operations Manager',
      location: 'Premium City, ST',
      type: 'Full-Time',
      salary: '$60,000 - $80,000',
      description: 'Oversee daily operations of our luxury car service, including fleet management, scheduling, and quality assurance.',
      requirements: [
        'Bachelor\'s degree or equivalent experience',
        '3+ years in operations management',
        'Strong leadership and organizational skills',
        'Experience in transportation or hospitality industry',
        'Proficiency in scheduling and dispatch software',
        'Excellent communication skills'
      ]
    },
    {
      title: 'Customer Service Representative',
      location: 'Premium City, ST (Remote options available)',
      type: 'Full-Time',
      salary: '$35,000 - $45,000',
      description: 'Handle customer inquiries, bookings, and provide exceptional service to our distinguished clientele.',
      requirements: [
        'High school diploma or equivalent',
        '2+ years customer service experience',
        'Excellent verbal and written communication',
        'Proficiency in computer systems and booking software',
        'Professional phone etiquette',
        'Ability to work various shifts including weekends'
      ]
    },
    {
      title: 'Fleet Maintenance Technician',
      location: 'Premium City, ST',
      type: 'Full-Time',
      salary: '$40,000 - $55,000',
      description: 'Maintain and service our luxury vehicle fleet to the highest standards. Ensure all vehicles are in pristine condition.',
      requirements: [
        'ASE certification or equivalent',
        '3+ years automotive maintenance experience',
        'Experience with luxury vehicles preferred',
        'Attention to detail and quality standards',
        'Valid driver\'s license',
        'Ability to lift 50+ lbs'
      ]
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Application submitted:', formData);
    setSubmitted(true);
    
    setTimeout(() => {
      setSubmitted(false);
      setSelectedJob(null);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        coverLetter: '',
        availability: ''
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl mb-6 text-[#D4AF37]">Join Our Team</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Build your career with a premier luxury transportation company. 
          We offer competitive compensation, excellent benefits, and opportunities for growth.
        </p>
      </section>

      {/* Job Openings */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl mb-12 text-[#D4AF37] text-center">Current Openings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {jobOpenings.map((job, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-300 p-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl text-[#D4AF37]">{job.title}</h3>
                  <Briefcase className="text-[#D4AF37]" size={28} />
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={18} className="text-[#D4AF37]" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={18} className="text-[#D4AF37]" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign size={18} className="text-[#D4AF37]" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {job.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-[#D4AF37] mb-3">Requirements:</h4>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-[#D4AF37] mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setSelectedJob(index);
                    setFormData({ ...formData, position: job.title });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full px-6 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider"
                >
                  APPLY NOW
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      {selectedJob !== null && (
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-[#1a1a1a] to-black border border-[#D4AF37]/20 p-8 md:p-12">
              <h2 className="text-3xl mb-2 text-[#D4AF37]">Application Form</h2>
              <p className="text-gray-400 mb-8">Applying for: {jobOpenings[selectedJob].title}</p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-[#D4AF37] text-6xl mb-6">✓</div>
                  <h3 className="text-2xl mb-4 text-[#D4AF37]">Application Submitted!</h3>
                  <p className="text-gray-300 mb-2">
                    Thank you for your interest in joining our team.
                  </p>
                  <p className="text-gray-400">
                    We'll review your application and contact you if you're selected for an interview.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2">Years of Experience *</label>
                        <input
                          type="text"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                          placeholder="e.g., 5 years"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2">Availability *</label>
                        <select
                          name="availability"
                          value={formData.availability}
                          onChange={handleChange}
                          required
                          className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        >
                          <option value="">Select availability</option>
                          <option value="immediate">Immediate</option>
                          <option value="2weeks">2 Weeks Notice</option>
                          <option value="1month">1 Month Notice</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Cover Letter / Why You? *</label>
                      <textarea
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full bg-black border border-[#D4AF37]/30 px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                        placeholder="Tell us why you're the perfect fit for this position..."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center gap-2">
                        <Upload size={18} className="text-[#D4AF37]" />
                        Upload Resume *
                      </label>
                      <div className="border-2 border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37] transition-colors p-8 text-center">
                        <Upload size={32} className="text-[#D4AF37] mx-auto mb-2" />
                        <p className="text-gray-400 mb-1">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-sm">PDF, DOC, or DOCX (Max 5MB)</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedJob(null)}
                        className="flex-1 px-8 py-4 border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 tracking-wider"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-8 py-4 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider"
                      >
                        SUBMIT APPLICATION
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-16 text-[#D4AF37]">Employee Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">💰</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Competitive Pay</h3>
              <p className="text-gray-400">Above industry standard compensation</p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">🏥</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Health Benefits</h3>
              <p className="text-gray-400">Medical, dental, and vision coverage</p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">📈</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Career Growth</h3>
              <p className="text-gray-400">Training and advancement opportunities</p>
            </div>
            <div className="text-center p-6">
              <div className="text-[#D4AF37] text-3xl mb-4">🏖️</div>
              <h3 className="text-xl mb-2 text-[#D4AF37]">Paid Time Off</h3>
              <p className="text-gray-400">Generous vacation and sick leave</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
