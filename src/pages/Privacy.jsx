import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#f8faf8] py-12 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center text-[#6b9b76] hover:text-[#5a8a65] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-[#e0ede4]"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#6b9b76]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#3d5244]">Privacy Policy</h1>
          </div>
          <p className="text-gray-500 mb-8">Last Updated: March 2026</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            <p>
              MoodFull (“we,” “our,” or “us”) respects your privacy and is committed to protecting your information. This Privacy Policy explains how we collect, use, and safeguard your data when you use the MoodFull mobile application.
            </p>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">1. Information We Collect</h3>
              <p>We may collect the following categories of information:</p>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-bold text-gray-900">Personal Information</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Name</li>
                    <li>Email Address</li>
                    <li>Phone Number</li>
                    <li>User ID</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900">Sensitive Information</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Health data (e.g., dietary preferences, wellness-related inputs)</li>
                    <li>Fitness data</li>
                    <li>Other sensitive information voluntarily provided by you</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">Usage & Interaction Data</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Product Interaction (features used, actions taken)</li>
                    <li>Search History</li>
                    <li>Other Usage Data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">Device & Technical Data</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Performance Data</li>
                    <li>Crash Data</li>
                    <li>Other Diagnostic Data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">Location Data</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Coarse Location (approximate location, not precise GPS)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">App Features & Permissions</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Environment Scanning (e.g., camera or barcode scanning for food items)</li>
                    <li><strong>Speech Recognition (Guideline 5.1.1(ii)):</strong> MoodFull may use speech recognition technology to allow for voice-to-text input (e.g., dictating mood, ingredients, or search queries). The speech data is processed securely and is used solely to provide and improve the voice input features of the app. It is not used for any other purpose and is not shared with unauthorized third parties.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">Support & Communications</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Customer Support communications and related information</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">Financial Information</h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Payment Information (processed securely by third-party providers such as Apple; we do not store full payment details)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">2. How We Use Your Information</h3>
              <p>We use your information to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide and personalize app features</li>
                <li>Generate AI-powered recipe and meal recommendations</li>
                <li>Improve app performance and user experience</li>
                <li>Process transactions and manage subscriptions</li>
                <li>Respond to customer support requests</li>
                <li>Analyze usage trends and optimize features</li>
                <li>Maintain app security and prevent fraud</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">3. AI & Content Disclaimer</h3>
              <p>MoodFull uses artificial intelligence to generate recipes, suggestions, and recommendations.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>We do not provide medical, dietary, or professional advice</li>
                <li>Information may not always be accurate or suitable for your needs</li>
                <li>You should consult a qualified professional for health-related concerns</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">4. How We Share Information</h3>
              <p>We do not sell your personal data. We may share information with:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Service providers (hosting, analytics, payment processing)</li>
                <li>Legal authorities if required by law</li>
                <li>Business transfers (e.g., merger or acquisition)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">5. Data Storage & Security</h3>
              <p>We implement reasonable administrative, technical, and physical safeguards to protect your information. However, no system is 100% secure.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">6. Data Retention</h3>
              <p>We retain your information only as long as necessary to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">7. Your Rights & Account Deletion</h3>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Access your data</li>
                <li>Request deletion of your data</li>
                <li>Correct inaccurate information</li>
                <li>Opt out of certain data uses</li>
              </ul>
              <div className="mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">Account Deletion (Guideline 5.1.1(v) - Data Collection and Storage)</h4>
                <p>You can initiate the deletion of your account and all associated data at any time directly within the app. Navigate to <strong>Account Settings &gt; Delete Account</strong>. Upon confirmation, your personal data, saved recipes, and preferences will be permanently removed from our systems.</p>
              </div>
              <p className="mt-4">To make a manual request, contact us at: support@moodfullapp.com</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">8. Children's Privacy</h3>
              <p>MoodFull is not intended for children under 13. We do not knowingly collect data from children.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">9. Third-Party Services</h3>
              <p>MoodFull may use third-party services (such as Apple, analytics tools, or cloud providers). These services have their own privacy policies.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">10. Changes to This Policy</h3>
              <p>We may update this Privacy Policy from time to time. Continued use of the app after changes means you accept the updated policy.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-[#3d5244]">11. Contact & Support</h3>
              <p>If you have any questions about this Privacy Policy, need to manage your data, or require assistance with account deletion, please contact us at support@moodfullapp.com or via the support chat in the app.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}