import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const user = db.getCurrentUser();

  const handleCtaClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                <i className="ph-fill ph-wrench text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-tight text-navy-900">Trade<span className="text-brand-600">Mate</span></span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-navy-800 font-medium hover:text-brand-600 transition">Log In</Link>
                <Link to="/login" className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition shadow-md shadow-brand-500/20">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-navy-900 relative overflow-hidden text-white pt-24 pb-32 px-6 text-center">
        {/* Abstract Blue Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-brand-700 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-navy-800 border border-navy-700 px-4 py-1.5 rounded-full text-sm font-medium text-brand-100 mb-2">
            <i className="ph-fill ph-check-circle text-brand-500"></i>
            Made by a Tradie, for Tradies
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Paperwork Sucks. <br/>
            <span className="text-brand-500">We Make It Simple.</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Stop stuffing receipts in the glovebox. Snap a photo, and we’ll read the details for you. Tax time done in minutes, not weekends.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleCtaClick}
              className="bg-brand-600 hover:bg-brand-500 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-xl shadow-brand-900/20 transition transform hover:-translate-y-1"
            >
              Start Free Today
            </button>
            <a href="#how-it-works" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-lg font-semibold px-8 py-4 rounded-xl border border-white/10 transition">
              How It Works
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required for free plan.</p>
        </div>
      </header>

      {/* Trust/Social Proof Strip */}
      <div className="bg-navy-800 py-6 border-b border-navy-700">
        <div className="max-w-6xl mx-auto px-6 text-center">
             <p className="text-navy-100 text-sm font-medium uppercase tracking-widest opacity-60">Trusted by self-employed pros across the UK</p>
        </div>
      </div>

      {/* Features / Value Props */}
      <section id="how-it-works" className="py-24 bg-brand-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Built for the Van Life</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">We know you're busy. TradeMate is designed to be quick, easy, and get out of your way.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-6">
                <i className="ph-fill ph-camera text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Smart Scanning</h3>
              <p className="text-gray-600 leading-relaxed">
                Forget typing. Our smart scanner reads the date, vendor, and amount from your crumpled receipts automatically.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
               <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-6">
                <i className="ph-fill ph-files text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Batch Upload</h3>
              <p className="text-gray-600 leading-relaxed">
                Clear the dashboard in one go. Upload up to 5 receipts at a time and sort your week's expenses in seconds.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
               <div className="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-6">
                <i className="ph-fill ph-export text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Accountant Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                End of the month? One click exports everything to a neat CSV file. Your accountant will love you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
           <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Fair & Simple Pricing</h2>
            <p className="text-lg text-gray-600">Start for free. Upgrade only when you need to.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Free Plan - "The Starter Kit" */}
            <div className="flex flex-col border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-brand-200 transition">
              <div className="bg-gray-50 p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-navy-900">The Starter Kit</h3>
                  <p className="text-gray-500 text-sm mt-1">Perfect for part-timers or just starting out.</p>
              </div>
              <div className="p-8 flex-1">
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-extrabold text-navy-900">£0</span>
                    <span className="text-gray-500 ml-2">/ month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-gray-700">
                      <i className="ph-fill ph-check-circle text-brand-600 mt-1"></i>
                      <span><strong>10 Receipts</strong> per month</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <i className="ph-fill ph-check-circle text-brand-600 mt-1"></i>
                      <span>Smart Scanning</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <i className="ph-fill ph-check-circle text-brand-600 mt-1"></i>
                      <span>Secure Cloud Storage</span>
                    </li>
                     <li className="flex items-start gap-3 text-gray-700">
                      <i className="ph-fill ph-check-circle text-brand-600 mt-1"></i>
                      <span>CSV Export</span>
                    </li>
                  </ul>
              </div>
              <div className="p-6 pt-0">
                  <Link to="/login" className="block w-full py-3 px-4 bg-white border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-bold text-center rounded-xl transition">
                    Create Free Account
                  </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="flex flex-col border-2 border-brand-600 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                MOST POPULAR
              </div>
              <div className="bg-brand-600 p-6 text-white">
                  <h3 className="text-xl font-bold">The Full Toolbox</h3>
                  <p className="text-brand-100 text-sm mt-1">For full-time trades who mean business.</p>
              </div>
              <div className="p-8 flex-1 bg-white">
                   <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-extrabold text-navy-900">£10</span>
                    <span className="text-gray-500 ml-2">/ month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-navy-800">
                      <div className="bg-brand-100 rounded-full p-0.5"><i className="ph-bold ph-check text-brand-600 text-sm"></i></div>
                      <span className="font-semibold">Unlimited Receipts</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="bg-brand-100 rounded-full p-0.5"><i className="ph-bold ph-check text-brand-600 text-sm"></i></div>
                      <span>Priority Support</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="bg-brand-100 rounded-full p-0.5"><i className="ph-bold ph-check text-brand-600 text-sm"></i></div>
                      <span>Advanced Expense Categories</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <div className="bg-brand-100 rounded-full p-0.5"><i className="ph-bold ph-check text-brand-600 text-sm"></i></div>
                      <span>Everything in Starter</span>
                    </li>
                  </ul>
              </div>
              <div className="p-6 pt-0 bg-white">
                <Link to="/login" className="block w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-center rounded-xl transition shadow-lg shadow-brand-200">
                    Get Unlimited Access
                  </Link>
                  <p className="text-center text-xs text-gray-400 mt-3">Cancel anytime. No lock-in contracts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-navy-900 text-white py-20 px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to sort your taxes?</h2>
          <p className="text-brand-100 mb-8 max-w-xl mx-auto">Join thousands of other tradespeople saving hours every month.</p>
          <button onClick={handleCtaClick} className="bg-brand-600 hover:bg-brand-500 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg transition">
              Get Started for Free
          </button>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-500 py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <i className="ph-fill ph-wrench text-brand-600 text-2xl"></i>
            <span className="text-lg font-bold text-navy-900 tracking-tight">Trade<span className="text-brand-600">Mate</span></span>
          </div>
          <div className="text-sm">
             <p>&copy; {new Date().getFullYear()} TradeMate. Made with <i className="ph-fill ph-heart text-red-500"></i> by a Tradie.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;