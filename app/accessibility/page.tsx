import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility - Men\'s Hub',
  description: 'Men\'s Hub Accessibility Statement - Our commitment to making our website accessible to everyone.',
}

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Accessibility Statement</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 text-sm mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Men's Hub is committed to ensuring that our website is accessible to people with disabilities. We strive 
            to provide an inclusive digital experience that enables all users to access our content and functionality 
            effectively, regardless of their abilities or disabilities.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We continuously work to improve the accessibility of our website and ensure compliance with relevant 
            accessibility standards and guidelines.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Accessibility Standards</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These 
            guidelines explain how to make web content more accessible for people with disabilities and user-friendly 
            for everyone.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The guidelines have three levels of accessibility (A, AA, and AAA). We have chosen Level AA as our target 
            conformance level as it addresses the major barriers for disabled users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Accessibility Features</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our website includes the following accessibility features:
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Navigation and Structure</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Clear and consistent navigation throughout the site</li>
            <li>Logical heading structure (H1, H2, H3, etc.)</li>
            <li>Descriptive page titles and meta descriptions</li>
            <li>Skip navigation links to main content</li>
            <li>Breadcrumb navigation where appropriate</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Visual Design</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>High color contrast ratios for better readability</li>
            <li>Scalable fonts that can be enlarged up to 200% without loss of functionality</li>
            <li>Clear focus indicators for keyboard navigation</li>
            <li>Meaningful link text that describes the destination</li>
            <li>Alternative text for all informative images</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Keyboard Navigation</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>All interactive elements are accessible via keyboard</li>
            <li>Logical tab order throughout pages</li>
            <li>Visible focus indicators</li>
            <li>No keyboard traps</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Content</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Clear and simple language</li>
            <li>Proper use of headings and lists for content structure</li>
            <li>Form labels clearly associated with their controls</li>
            <li>Error messages that are descriptive and helpful</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Assistive Technology Compatibility</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our website is designed to be compatible with assistive technologies, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Screen readers (such as JAWS, NVDA, and VoiceOver)</li>
            <li>Voice recognition software</li>
            <li>Keyboard navigation tools</li>
            <li>Browser zoom functionality</li>
            <li>High contrast display settings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Browser Compatibility</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our website is tested and optimized for the following browsers with accessibility features enabled:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Chrome (latest version)</li>
            <li>Firefox (latest version)</li>
            <li>Safari (latest version)</li>
            <li>Edge (latest version)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Mobile Accessibility</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our website is designed to be fully accessible on mobile devices, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Touch target sizes that meet minimum requirements</li>
            <li>Responsive design that works across different screen sizes</li>
            <li>Support for mobile screen readers</li>
            <li>Gesture-free navigation options</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Third-Party Content</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            While we strive to ensure that all content on our website is accessible, some third-party content 
            (such as embedded videos, advertisements, or social media plugins) may not fully meet our accessibility 
            standards. We work with our partners to improve the accessibility of such content whenever possible.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Feedback and Assistance</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We welcome your feedback on the accessibility of Men's Hub. If you encounter any accessibility barriers, 
            please contact us:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Email: accessibility@menshb.com</li>
            <li>Contact form: <a href="/contact" className="text-red-600 hover:text-red-700">Contact Us</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ongoing Improvements</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Accessibility is an ongoing effort. We regularly review and test our website to identify and address 
            accessibility issues. Our commitment includes:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Regular accessibility audits</li>
            <li>User testing with people with disabilities</li>
            <li>Staff training on accessibility best practices</li>
            <li>Staying current with accessibility standards and guidelines</li>
            <li>Incorporating accessibility considerations into our design and development process</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Accessibility Resources</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For more information about web accessibility, we recommend the following resources:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                Web Accessibility Initiative (WAI)
              </a>
            </li>
            <li>
              <a href="https://www.ada.gov/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                Americans with Disabilities Act (ADA)
              </a>
            </li>
            <li>
              <a href="https://webaim.org/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                WebAIM (Web Accessibility in Mind)
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Updates to This Statement</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this accessibility statement from time to time to reflect changes to our website or 
            accessibility practices. We will post any changes on this page and update the "Last updated" date 
            at the top of this statement.
          </p>
        </section>
      </div>
    </div>
  )
} 