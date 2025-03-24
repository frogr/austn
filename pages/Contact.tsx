
import { ChevronLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Contact = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formState);
    // Here you would typically send the data to a server
    // For now, we'll just reset the form
    setFormState({ name: '', email: '', message: '' });
    alert('Message sent successfully!');
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 lg:px-24 pb-12 animate-page-transition">
      <Link to="/" className="inline-flex items-center text-sm mb-8 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow hover:shadow-md transition-all">
        <ChevronLeft size={16} />
        <span className="ml-1">Back to Home</span>
      </Link>
      
      <div className="mb-12 text-center">
        <h1 className="font-pixel text-3xl mb-4 text-retro-purple">Contact Me</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Got a project in mind? Let's work together to bring your ideas to life.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-retro-purple focus:border-transparent outline-none transition-all"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-retro-purple focus:border-transparent outline-none transition-all"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formState.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-retro-purple focus:border-transparent outline-none transition-all"
                placeholder="Your message here..."
              ></textarea>
            </div>
            
            <div className="text-right">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-retro-purple text-white rounded-full font-medium shadow-md hover:bg-opacity-90 transition-colors"
              >
                <span>Send Message</span>
                <Send size={16} className="ml-2" />
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md border border-white/20">
            <h3 className="font-medium mb-2">Email</h3>
            <p className="text-gray-600">austin@example.com</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md border border-white/20">
            <h3 className="font-medium mb-2">Phone</h3>
            <p className="text-gray-600">(123) 456-7890</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md border border-white/20">
            <h3 className="font-medium mb-2">Location</h3>
            <p className="text-gray-600">San Francisco, CA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
