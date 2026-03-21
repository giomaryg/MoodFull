import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PrivacyPolicyPanel({ isOpen, onClose }) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white p-0 flex flex-col h-full">
        <div className="p-6 pb-4 border-b border-gray-100">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-[#6b9b76] flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Privacy Policy
            </SheetTitle>
            <SheetDescription>
              Last Updated: March 2026
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 text-sm text-gray-700 pb-8">
            <p>
              MoodFull (“we,” “our,” or “us”) respects your privacy and is committed to protecting your information. This Privacy Policy explains how we collect, use, and safeguard your data when you use the MoodFull mobile application.
            </p>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">1. Information We Collect</h3>
              <p>We may collect the following categories of information:</p>
              
              <div className="space-y-3 mt-3">
                <div>
                  <h4 className="font-medium text-gray-800">Personal Information</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Name</li>
                    <li>Email Address</li>
                    <li>Phone Number</li>
                    <li>User ID</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800">Sensitive Information</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Health data (e.g., dietary preferences, wellness-related inputs)</li>
                    <li>Fitness data</li>
                    <li>Other sensitive information voluntarily provided by you</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Usage & Interaction Data</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Product Interaction (features used, actions taken)</li>
                    <li>Search History</li>
                    <li>Other Usage Data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Device & Technical Data</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Performance Data</li>
                    <li>Crash Data</li>
                    <li>Other Diagnostic Data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Location Data</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Coarse Location (approximate location, not precise GPS)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">App Features & Permissions</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Environment Scanning (e.g., camera or barcode scanning for food items)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Support & Communications</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Customer Support communications and related information</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800">Financial Information</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                    <li>Payment Information (processed securely by third-party providers such as Apple; we do not store full payment details)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">2. How We Use Your Information</h3>
              <p>We use your information to:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                <li>Provide and personalize app features</li>
                <li>Generate AI-powered recipe and meal recommendations</li>
                <li>Improve app performance and user experience</li>
                <li>Process transactions and manage subscriptions</li>
                <li>Respond to customer support requests</li>
                <li>Analyze usage trends and optimize features</li>
                <li>Maintain app security and prevent fraud</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">3. AI & Content Disclaimer</h3>
              <p>MoodFull uses artificial intelligence to generate recipes, suggestions, and recommendations.</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                <li>We do not provide medical, dietary, or professional advice</li>
                <li>Information may not always be accurate or suitable for your needs</li>
                <li>You should consult a qualified professional for health-related concerns</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">4. How We Share Information</h3>
              <p>We do not sell your personal data. We may share information with:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                <li>Service providers (hosting, analytics, payment processing)</li>
                <li>Legal authorities if required by law</li>
                <li>Business transfers (e.g., merger or acquisition)</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">5. Data Storage & Security</h3>
              <p>We implement reasonable administrative, technical, and physical safeguards to protect your information. However, no system is 100% secure.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">6. Data Retention</h3>
              <p>We retain your information only as long as necessary to:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">7. Your Rights</h3>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                <li>Access your data</li>
                <li>Request deletion of your data</li>
                <li>Correct inaccurate information</li>
                <li>Opt out of certain data uses</li>
              </ul>
              <p className="mt-2">To make a request, contact us at: support@moodfullapp.com</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">8. Children's Privacy</h3>
              <p>MoodFull is not intended for children under 13. We do not knowingly collect data from children.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">9. Third-Party Services</h3>
              <p>MoodFull may use third-party services (such as Apple, analytics tools, or cloud providers). These services have their own privacy policies.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">10. Changes to This Policy</h3>
              <p>We may update this Privacy Policy from time to time. Continued use of the app after changes means you accept the updated policy.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">11. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us.</p>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}