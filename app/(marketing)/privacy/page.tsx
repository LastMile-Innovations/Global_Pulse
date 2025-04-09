import React from 'react'; 

export default function PrivacyPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto bg-card p-8 md:p-10 rounded-lg shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 7, 2025</p>

        <div className="prose prose-zinc dark:prose-invert max-w-none">

          <section className="border-b border-border pb-8 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">1. Introduction</h2>
            <p>This Privacy Policy describes how Global Pulse (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares information about you when you use our website, mobile applications, and services (collectively, the &quot;Services&quot;). Please read this policy carefully.</p>
            <p>Please read this Privacy Policy carefully. By using our Services, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy.</p>
          </section>

          <section className="border-b border-border pb-8 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">2. Information We Collect</h2>

            <h3 className="text-lg font-medium mb-2">2.1 Information You Provide</h3>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Account information (name, email address, password)</li>
              <li>Profile information (profile picture, biographical information)</li>
              <li>Survey responses and opinions</li>
              <li>Communications with us</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-6">2.2 Information We Collect Automatically</h3>
            <p>When you use our Services, we automatically collect certain information, including:</p>
            <ul>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage information (pages visited, time spent on pages, links clicked)</li>
              <li>Location information (general location based on IP address)</li>
              <li>Cookies and similar technologies</li>
            </ul>
            <p>information automatically when you use the Services. This may include your IP address, device type, operating system, browser type, pages you visit, time spent on pages, links clicked, and referring URL. We may use cookies and similar tracking technologies to collect this information. You can control the use of cookies at the individual browser level, but if you choose to disable cookies, it may limit your use of certain features or functions of our Services. We don&apos;t track your precise location, but we may infer your general location (e.g., country or city) from your IP address.</p>
          </section>

          <section className="border-b border-border pb-8 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our Services</li>
              <li>Process and display your survey responses and opinions</li>
              <li>Generate aggregated insights and analytics</li>
              <li>Communicate with you about our Services</li>
              <li>Personalize your experience</li>
              <li>Protect against fraud and unauthorized access</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="border-b border-border pb-8 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">4. How We Share Your Information</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>With service providers who perform services on our behalf</li>
              <li>With other users (only your public profile information and anonymized responses)</li>
              <li>In response to legal process or when required by law</li>
              <li>In connection with a merger, sale, or acquisition</li>
            </ul>
            <p className="mt-4">We may also share aggregated or de-identified information that cannot reasonably be used to identify you.</p>
          </section>

          <section className="border-b border-border pb-8 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">5. Your Choices</h2>
            <p>You have several choices regarding your information:</p>
            <ul>
              <li>Account Information: You can update your account information through your account settings.</li>
              <li>Cookies: Most web browsers are set to accept cookies by default. You can usually change your browser settings to remove or reject cookies.</li>
              <li>Promotional Communications: You can opt out of receiving promotional emails by following the instructions in those emails.</li>
              <li>Data Access and Deletion: You can request access to your personal information or request that we delete your personal information by contacting us.</li>
            </ul>
          </section>

          <section className="border-b border-border pb-8 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">6. Data Security</h2>
            <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems.</p>
          </section>

          <section className="border-b border-border pb-8 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">7. Children's Privacy</h2>
            <p>Our Services are not directed to children under 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete that information as soon as possible.</p>
          </section>

          <section className="border-b border-border pb-8 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">8. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a notice on our website prior to the changes becoming effective. Your continued use of our Services after any such changes constitutes your acceptance of the new Privacy Policy.</p>
          </section>

          <section className="pb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4 text-foreground">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>
              Global Pulse, Inc.<br />
              1234 Innovation Way<br />
              San Francisco, CA 94103<br />
              <a href="mailto:privacy@globalpulse.app" className="text-primary hover:underline">privacy@globalpulse.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
