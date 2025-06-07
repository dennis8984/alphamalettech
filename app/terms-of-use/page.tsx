import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use - Men\'s Hub',
  description: 'Terms of Use for Men\'s Hub - Please read these terms carefully before using our website.',
}

export default function TermsOfUsePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 text-sm mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf 
            of an entity ("you") and Men's Hub ("we," "us," or "our"), concerning your access to and use of the 
            menshb.com website as well as any other media form, media channel, mobile website or mobile application 
            related, linked, or otherwise connected thereto (collectively, the "Site").
          </p>
          <p className="text-gray-700 leading-relaxed">
            By accessing the Site, you agree that you have read, understood, and agree to be bound by all of these 
            Terms of Use. If you do not agree with all of these Terms of Use, then you are expressly prohibited 
            from using the Site and you must discontinue use immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our Site provides information and resources related to men's health, fitness, nutrition, style, and lifestyle. 
            You may not use our Site:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>For any unlawful purpose or to solicit others to act unlawfully</li>
            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>To submit false or misleading information</li>
            <li>To upload or transmit viruses or any other type of malicious code</li>
            <li>To collect or track the personal information of others</li>
            <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Content</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, 
            and other functionality, and may provide you with the opportunity to create, submit, post, display, 
            transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            You are entirely responsible for the content of, and any harm resulting from, any of your postings or 
            any other content you submit to the Site. When you create or make available any content, you represent 
            and warrant that:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>You are the sole author and owner of the intellectual property rights thereto</li>
            <li>All content is accurate and not misleading</li>
            <li>Use of the content will not infringe, violate, or misappropriate the rights of any third party</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Health and Medical Disclaimer</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-gray-800 font-semibold">Important Medical Disclaimer</p>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            The information provided on Men's Hub is for educational and informational purposes only. It is not intended 
            as medical advice and should not be used to diagnose, treat, cure, or prevent any health condition.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Always consult with a qualified healthcare professional</strong> before making any changes to your 
            diet, exercise routine, or lifestyle. The content on this Site should not replace professional medical advice, 
            diagnosis, or treatment.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Individual results may vary. What works for one person may not work for another. Always listen to your body 
            and seek medical attention if you experience any adverse effects from following advice found on this Site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Site and its original content, features, and functionality are and will remain the exclusive property 
            of Men's Hub and its licensors. The Site is protected by copyright, trademark, and other laws. Our 
            trademarks and trade dress may not be used in connection with any product or service without our prior 
            written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Affiliate Links and Advertisements</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Men's Hub may contain affiliate links to products and services. When you click on these links and make 
            a purchase, we may receive a commission at no additional cost to you. We only recommend products and 
            services that we believe in and think will be beneficial to our readers.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The Site also displays advertisements through third-party advertising networks including Ezoic and 
            Google AdSense. These advertisers may collect information about your browsing activities across 
            different websites.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We care about data privacy and security. Please review our Privacy Policy, which also governs your use 
            of the Site, to understand our practices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            We may terminate or suspend your access immediately, without prior notice or liability, for any reason 
            whatsoever, including without limitation if you breach the Terms of Use. Upon termination, your right 
            to use the Site will cease immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The information on this Site is provided on an "as is" basis. To the fullest extent permitted by law, 
            Men's Hub excludes all representations, warranties, conditions and terms whether express or implied, 
            statutory or otherwise.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Men's Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
            including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting 
            from your use of the Site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms shall be interpreted and enforced in accordance with the laws of the jurisdiction in which 
            Men's Hub operates, without regard to conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use 
            at any time and for any reason. We will alert you about any changes by updating the "Last updated" 
            date of these Terms of Use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions or concerns about these Terms of Use, please contact us:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
            <li>By email: legal@menshb.com</li>
            <li>On this page: <a href="/contact" className="text-red-600 hover:text-red-700">Contact Us</a></li>
          </ul>
        </section>
      </div>
    </div>
  )
} 