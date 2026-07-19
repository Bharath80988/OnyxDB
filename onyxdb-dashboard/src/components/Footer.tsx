import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Database, Shield, Globe, Code, MessageSquare, Briefcase } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001E2B] text-white pt-20 pb-10 border-t border-[#001E2B]/50 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="OnyxDB" className="w-8 h-8 rounded-md" />
              <span className="font-display font-bold text-xl">OnyxDB</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              The lightning-fast, local-first B+ Tree database for modern applications. Build offline, deploy anywhere.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#00ED64] transition-colors"><Code className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#00ED64] transition-colors"><MessageSquare className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#00ED64] transition-colors"><Briefcase className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-gray-300">About</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trust Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-gray-300">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Customer Portal</a></li>
              <li><Link to="/status" className="hover:text-white transition-colors">OnyxDB Status</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Manage Cookies</a></li>
              <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-gray-300">Products</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">OnyxDB Local</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise Advanced</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Edition</a></li>
              <li><Link to="/app" className="hover:text-white transition-colors">Visual Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 text-gray-300">Data Basics</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">B+ Tree Databases</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NoSQL Databases</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Document Databases</a></li>
              <li><a href="#" className="hover:text-white transition-colors">RAG Database</a></li>
              <li><a href="#" className="hover:text-white transition-colors">ACID Transactions</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[#001E2B]/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            &copy; 2026 OnyxDB, Inc.
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
