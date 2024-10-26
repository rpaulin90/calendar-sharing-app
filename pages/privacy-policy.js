import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <div className="container">
      <Head>
        <title>Privacy Policy - Copy Paste Calendar</title>
      </Head>

      <main className="main">
        <h1>Privacy Policy</h1>
        <div className="content">
          <p className="last-updated">Last Updated: October 26, 2024</p>

          <section>
            <h2>1. Introduction</h2>
            <p>Welcome to Copy Paste Calendar ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our calendar scheduling service.</p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>We collect and process the following information through your Google account:</p>
            <ul>
              <li>Basic profile information (name and email address)</li>
              <li>Calendar event data (event times, titles, and availability)</li>
              <li>Directory information (when searching for other users in your organization)</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your information solely for the following purposes:</p>
            <ul>
              <li>Displaying your calendar events to help you find available time slots</li>
              <li>Enabling you to search for and view the calendars of other people in your organization</li>
              <li>Personalizing your experience within the application</li>
              <li>Providing technical support and responding to your requests</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Storage and Security</h2>
            <p>We do not store any of your calendar data or personal information on our servers. All calendar data is accessed in real-time through Google's APIs and is only displayed during your active session. We implement appropriate security measures to protect your data during transmission.</p>
          </section>

          <section>
            <h2>5. Third-Party Services</h2>
            <p>We use Google Calendar API and Google Directory API to provide our services. Your use of these Google services is subject to Google's Privacy Policy and Terms of Service.</p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>Since we do not store your calendar data or personal information, there is no data retention period. Your data exists only within your Google account and is accessed temporarily during your use of our application.</p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Revoke access to your Google account at any time through your Google Account settings (https://myaccount.google.com/permissions)</li>
              <li>Request information about how your data is processed</li>
              <li>Stop using our service at any time</li>
            </ul>
            <p>Since we don't store any user data on our servers, there is no user data to delete. When you revoke access or stop using our service, we immediately lose all access to your Google Calendar data.</p>
          </section>

          <section>
            <h2>8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.</p>
          </section>

          <section>
            <h2>9. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our practices, please contact us at [Your Contact Email].</p>
          </section>

          <div className="back-link">
            <Link href="/">← Back to Home</Link>
          </div>
        </div>
      </main>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          background-color: #f0f4f8;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        .main {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        h1 {
          color: #333;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-align: center;
          font-weight: bold;
        }

        .last-updated {
          color: #666;
          font-style: italic;
          margin-bottom: 2rem;
        }

        section {
          margin-bottom: 2rem;
        }

        h2 {
          color: #444;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        p, li {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        ul {
          margin-left: 2rem;
          margin-bottom: 1rem;
        }

        .back-link {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .back-link a {
          color: #0070f3;
          text-decoration: none;
        }

        .back-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;