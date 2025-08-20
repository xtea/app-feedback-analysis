import React from 'react';
import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Privacy Policy | AppReview.ai</title>
        <meta name="robots" content="index,follow" />
      </Helmet>
      
      <div className="bg-white rounded-lg shadow-sm border p-8 sm:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Effective Date: January 1, 2024</p>
          <p className="text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <div className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              At AppReview.ai ("we," "our," or "us"), we are committed to protecting your privacy and ensuring 
              the security of your personal information. This Privacy Policy explains how we collect, use, 
              process, and protect information when you use our website and services.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
            <ul className="space-y-2 mb-4">
              <li>Email address when you create an account or sign in</li>
              <li>Authentication data provided by third-party authentication services</li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">Usage Information</h3>
            <ul className="space-y-2 mb-4">
              <li>App identifiers and URLs you submit for analysis</li>
              <li>Analysis reports and insights generated through our service</li>
              <li>Usage patterns, feature interactions, and performance data</li>
              <li>Device information, browser type, and IP address</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-3">Analytics Data</h3>
            <ul className="space-y-2">
              <li>Website navigation patterns and user interactions</li>
              <li>Service performance metrics and error logs</li>
              <li>Aggregated usage statistics to improve our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="space-y-3">
              <li><strong>Service Delivery:</strong> To provide app review analysis and generate insights</li>
              <li><strong>Account Management:</strong> To create, maintain, and secure your account</li>
              <li><strong>Communication:</strong> To send important updates, security notices, and support</li>
              <li><strong>Improvement:</strong> To enhance features, performance, and user experience</li>
              <li><strong>Security:</strong> To detect, prevent, and address technical issues and fraud</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
            <p className="mb-4">We do not sell, trade, or rent your personal information. We may share information in these limited circumstances:</p>
            <ul className="space-y-2">
              <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our service</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              <li><strong>Consent:</strong> With your explicit permission for specific purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="mb-4">We implement industry-standard security measures to protect your information:</p>
            <ul className="space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and monitoring</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure infrastructure and hosting environments</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide our services and comply with legal obligations. 
              Account information is retained while your account is active. Analysis data may be retained for service 
              improvement purposes in aggregated, anonymized form.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
            <p className="mb-4">You have the following rights regarding your personal information:</p>
            <ul className="space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal obligations</li>
              <li><strong>Portability:</strong> Request transfer of your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal information in certain circumstances</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
            <p>
              Our service integrates with third-party providers for authentication, analytics, and infrastructure. 
              These services have their own privacy policies and terms. We encourage you to review their policies 
              when using our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
            <p>
              Your information may be processed and stored in countries other than your own. We ensure appropriate 
              safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by 
              posting the new policy on this page and updating the "Last Updated" date. Your continued use of our 
              service after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="mb-4">If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Email:</strong> privacy@AppReview.ai</p>
              <p><strong>Subject Line:</strong> Privacy Policy Inquiry</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


