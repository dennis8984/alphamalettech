import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Men\'s Hub',
  description: 'Privacy Policy for Men\'s Hub - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 text-sm mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Men's Hub ("we," "our," or "us") operates the website menshb.com (the "Service"). This Privacy Policy 
            informs you of our policies regarding the collection, use, and disclosure of personal data when you use 
            our Service and the choices you have associated with that data.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We use your data to provide and improve the Service. By using the Service, you agree to the collection 
            and use of information in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            While using our Service, we may ask you to provide us with certain personally identifiable information 
            that can be used to contact or identify you. This may include:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Email address (for newsletter subscriptions)</li>
            <li>Name (when provided voluntarily)</li>
            <li>Comments and feedback</li>
            <li>Usage data and analytics</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may collect information about how you access and use the Service, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Your device's Internet Protocol address (IP address)</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on pages</li>
            <li>Date and time of your visit</li>
            <li>Unique device identifiers and other diagnostic data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Men's Hub uses the collected data for various purposes:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To send you newsletters and marketing communications (with your consent)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to track activity on our Service and hold certain information. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We also work with third-party advertising partners (including Ezoic and Google AdSense) who may use 
            cookies and web beacons to collect information about your visits to this and other websites in order 
            to provide advertisements about goods and services of interest to you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our Service may contain links to third-party websites or services that are not owned or controlled by Men's Hub. 
            We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any 
            third party websites or services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Google Analytics (for website analytics)</li>
            <li>Supabase (for database and authentication services)</li>
            <li>Ezoic (for ad optimization)</li>
            <li>Google AdSense (for advertising)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            The security of your data is important to us, but remember that no method of transmission over the Internet, 
            or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to 
            protect your personal data, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You have certain rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>The right to access, update or delete your information</li>
            <li>The right to withdraw consent</li>
            <li>The right to data portability</li>
            <li>The right to object to processing</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            To exercise these rights, please contact us at privacy@menshb.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our Service does not address anyone under the age of 18. We do not knowingly collect personally 
            identifiable information from anyone under the age of 18. If you are a parent or guardian and you 
            are aware that your child has provided us with personal data, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
            new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
            <li>By email: privacy@menshb.com</li>
            <li>On this page: <a href="/contact" className="text-red-600 hover:text-red-700">Contact Us</a></li>
          </ul>
        </section>
      </div>
    </div>
  )
} 