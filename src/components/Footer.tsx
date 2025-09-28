import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-gray-200 " style={{ background: "var(--gradient-primary)" }}>
            <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-600">

                {/* Brand */}
                <div>
                    <h2 className="text-lg font-semibold text-[#ffffff]">Footage Flow</h2>
                    <p className="mt-2 text-[#ffffff]">
                        AI-powered tools for video creation, sharing, and performance tracking.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-semibold text-[#ffffff]">Quick Links</h3>
                    <ul className="mt-3 space-y-2">
                        <li><a href="#" className="hover:text-primary">Upload</a></li>
                        <li><a href="#" className="hover:text-primary">Generate Video</a></li>
                        <li><a href="#" className="hover:text-primary">Smart Editor</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="font-semibold text-[#ffffff]">Resources</h3>
                    <ul className="mt-3 space-y-2">
                        <li><a href="#" className="hover:text-primary">Documentation</a></li>
                        <li><a href="#" className="hover:text-primary">Tutorials</a></li>
                        <li><a href="#" className="hover:text-primary">Blog</a></li>
                    </ul>
                </div>

                {/* Social */}
                <div>
                    <h3 className="font-semibold text-[#ffffff]">Follow Us</h3>
                    <div className="mt-3 flex space-x-4">
                        <a href="#" className="hover:text-primary">🌐</a>
                        <a href="#" className="hover:text-primary">🐦</a>
                        <a href="#" className="hover:text-primary">📸</a>
                        <a href="#" className="hover:text-primary">💼</a>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 mt-8">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-[#ffffff]">
                    <p>© {new Date().getFullYear()} Footage Flow. All rights reserved.</p>
                    <div className="mt-2 sm:mt-0 flex space-x-4">
                        <a href="#" className="hover:text-primary">Privacy Policy</a>
                        <a href="#" className="hover:text-primary">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>

    );
};

export default Footer;