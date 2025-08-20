import React from 'react';
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Terms of Service | AppReview.ai</title>
        <meta name="robots" content="index,follow" />
      </Helmet>
      
      <div className="bg-white rounded-lg shadow-sm border p-8 sm:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Effective Date: January 1, 2024</p>
          <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <div className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to AppReview.ai. These Terms of Service ("Terms") govern your use of our website, 
              services, and applications (collectively, the "Service"). By accessing or using our Service, 
              you agree to be bound by these Terms.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using AppReview.ai, you acknowledge that you have read, understood, and agree 
              to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, 
              please do not use our Service.
            </p>
            <p>
              These Terms apply to all users of the Service, including visitors, registered users, 
              and premium subscribers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              AppReview.ai provides AI-powered analysis of mobile app reviews from various app stores. 
              Our Service includes:
            </p>
            <ul className="space-y-2">
              <li>Automated collection and analysis of app store reviews</li>
              <li>Sentiment analysis and insight generation</li>
              <li>Feature request identification and prioritization</li>
              <li>Competitive analysis and benchmarking tools</li>
              <li>Reporting and data export capabilities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Account Creation</h3>
            <p className="mb-4">
              To access certain features, you must create an account by providing accurate and complete information. 
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 mb-3">Account Security</h3>
            <ul className="space-y-2 mb-4">
              <li>Use strong, unique passwords for your account</li>
              <li>Do not share your account credentials with others</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>You are responsible for all activities under your account</li>
            </ul>
            
            <h3 className="text-lg font-medium text-gray-800 mb-3">Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or engage 
              in prohibited activities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Permitted Uses</h3>
            <p className="mb-4">You may use our Service for legitimate business and personal purposes, including:</p>
            <ul className="space-y-2 mb-4">
              <li>Analyzing reviews for apps you own or have permission to analyze</li>
              <li>Conducting market research and competitive analysis</li>
              <li>Generating insights for product development and improvement</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">Prohibited Uses</h3>
            <p className="mb-4">You may not use our Service to:</p>
            <ul className="space-y-2">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Engage in fraudulent, deceptive, or misleading activities</li>
              <li>Attempt to circumvent security measures or access controls</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated tools to access the Service without permission</li>
              <li>Resell, redistribute, or create derivative works from our Service</li>
              <li>Submit malicious code, viruses, or harmful content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data and Content</h2>
            <h3 className="text-lg font-medium text-gray-800 mb-3">User-Submitted Content</h3>
            <p className="mb-4">
              You retain ownership of content you submit to our Service. By submitting content, you grant us 
              a limited license to process and analyze it for the purpose of providing our Service.
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 mb-3">Third-Party Content</h3>
            <p className="mb-4">
              Our Service analyzes publicly available app store reviews and data. We do not claim ownership 
              of this third-party content and use it solely for analysis purposes.
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 mb-3">Generated Reports</h3>
            <p>
              Reports and insights generated by our Service are provided to you for your use. You may not 
              redistribute these reports without proper attribution to AppReview.ai.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
            <p className="mb-4">
              The Service, including its software, algorithms, design, and content, is protected by intellectual 
              property laws. We retain all rights to our proprietary technology and services.
            </p>
            <h3 className="text-lg font-medium text-gray-800 mb-3">License to Use</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to use our Service in accordance 
              with these Terms. This license terminates when your access to the Service ends.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Payment and Billing</h2>
            <p className="mb-4">
              Certain features of our Service may require payment. By purchasing a subscription or service:
            </p>
            <ul className="space-y-2">
              <li>You agree to pay all applicable fees and charges</li>
              <li>Billing will occur according to your selected plan</li>
              <li>Refunds are subject to our refund policy</li>
              <li>We reserve the right to change pricing with reasonable notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Service Availability and Modifications</h2>
            <p className="mb-4">
              We strive to maintain high service availability but cannot guarantee uninterrupted access. 
              We reserve the right to:
            </p>
            <ul className="space-y-2">
              <li>Modify, suspend, or discontinue the Service with reasonable notice</li>
              <li>Perform maintenance and updates that may temporarily affect availability</li>
              <li>Implement new features or remove existing features</li>
              <li>Change the terms of service with appropriate notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Disclaimers and Warranties</h2>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <p className="font-medium text-yellow-800">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
              </p>
            </div>
            <p className="mb-4">We disclaim all warranties, including but not limited to:</p>
            <ul className="space-y-2">
              <li>Accuracy, completeness, or reliability of analysis results</li>
              <li>Fitness for a particular purpose or merchantability</li>
              <li>Non-infringement of third-party rights</li>
              <li>Continuous, uninterrupted, or error-free operation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <p className="font-medium text-red-800">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPREVIEW.AI SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
              </p>
            </div>
            <p>
              Our total liability for any claims related to the Service shall not exceed the amount paid 
              by you for the Service in the twelve months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless AppReview.ai from any claims, damages, or expenses 
              arising from your use of the Service, violation of these Terms, or infringement of any 
              third-party rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Governing Law and Disputes</h2>
            <p className="mb-4">
              These Terms are governed by and construed in accordance with the laws of [Jurisdiction]. 
              Any disputes shall be resolved through binding arbitration or in the courts of [Jurisdiction].
            </p>
            <p>
              Before pursuing formal legal action, we encourage users to contact us to resolve disputes amicably.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be communicated through 
              email or prominent notice on our Service. Your continued use after such notice constitutes 
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="mb-4">If you have questions about these Terms of Service, please contact us:</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email:</strong> legal@AppReview.ai</p>
              <p><strong>Subject Line:</strong> Terms of Service Inquiry</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;


