export default function TermsPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground mb-6">Last updated: April 7, 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to Global Pulse ("we," "our," or "us"). By accessing or using our website, mobile application, or
            any other services we offer (collectively, the "Services"), you agree to be bound by these Terms of Service
            ("Terms").
          </p>
          <p>
            Please read these Terms carefully. They govern your use of our Services and contain important information
            about your legal rights. If you do not agree with these Terms, you may not use our Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Using Our Services</h2>
          <h3 className="text-lg font-medium mb-2">2.1 Account Registration</h3>
          <p>
            To access certain features of our Services, you may need to create an account. You agree to provide
            accurate, current, and complete information during the registration process and to update such information
            to keep it accurate, current, and complete.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">2.2 Account Security</h3>
          <p>
            You are responsible for safeguarding your account credentials and for any activity that occurs under your
            account. You agree to notify us immediately of any unauthorized access to or use of your account.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">2.3 Age Restrictions</h3>
          <p>
            You must be at least 13 years old to use our Services. If you are under 18, you represent that you have your
            parent or guardian's permission to use the Services and that they have read and agree to these Terms on your
            behalf.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. User Content</h2>
          <p>
            Our Services allow you to share opinions, responses, and other content ("User Content"). You retain
            ownership of your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use,
            reproduce, modify, adapt, publish, translate, and distribute your User Content in connection with our
            Services.
          </p>
          <p>
            You are solely responsible for your User Content and represent that you have all rights necessary to grant
            us the license described above. You also represent that your User Content does not violate the rights of any
            third party or any applicable laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Use our Services in any way that violates any applicable law or regulation</li>
            <li>
              Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person
              or entity
            </li>
            <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
            <li>Collect or store personal data about other users without their consent</li>
            <li>
              Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory,
              vulgar, obscene, or otherwise objectionable
            </li>
            <li>
              Attempt to gain unauthorized access to any portion of the Services or any other systems or networks
              connected to the Services
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Termination</h2>
          <p>
            We may terminate or suspend your account and access to our Services at any time, without prior notice or
            liability, for any reason, including if you breach these Terms.
          </p>
          <p>
            Upon termination, your right to use the Services will immediately cease. All provisions of these Terms which
            by their nature should survive termination shall survive, including ownership provisions, warranty
            disclaimers, indemnity, and limitations of liability.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. If we make material changes, we will notify you by email or by
            posting a notice on our website prior to the changes becoming effective. Your continued use of our Services
            after any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p className="mt-2">
            Global Pulse, Inc.
            <br />
            1234 Innovation Way
            <br />
            San Francisco, CA 94103
            <br />
            legal@globalpulse.app
          </p>
        </section>
      </div>
    </div>
  )
}
