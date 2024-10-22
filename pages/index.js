import { signIn, signOut, useSession } from "next-auth/react"
import Head from 'next/head'
import { useState } from 'react'
import CalendarView from '../components/CalendarView'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  if (session) {
    return <CalendarView />
  }

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn("google")
    setIsLoading(false)
  }

  const togglePermissions = () => {
    setShowPermissions(!showPermissions)
  }

  return (
    <div className="container">
       <Head>
        <title>Copy Paste Calendar</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">Welcome to Copy Paste Calendar</h1>
        
        <p className="description">
          A simple way to find calendar availability and share it with others
        </p>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Connect Your Calendar</h3>
            <p>Sign in with Google to securely connect your calendar. We'll only view your events, never modify them.</p>
          </div>
          <ArrowRight className="step-arrow" />
          <div className="step">
            <div className="step-number">2</div>
            <h3>Select Available Slots</h3>
            <p>Easily mark your available time slots by clicking and dragging, or use our automatic detection feature to find your free periods effortlessly.</p>
          </div>
          <ArrowRight className="step-arrow" />
          <div className="step">
            <div className="step-number">3</div>
            <h3>Share Your Availability</h3>
            <p>Generate a shareable list of your available time slots in any timezone with just one click.</p>
          </div>
        </div>

        <div className="action-container">
          <div className="signin-container">
            <button onClick={handleSignIn} disabled={isLoading} className="signin-button">
              {isLoading ? 'Signing In...' : 'Get Started - Sign in with Google'}
            </button>
          </div>

          <div className="permissions-section">
            <button onClick={togglePermissions} className="toggle-permissions">
              {showPermissions ? 'Hide app access details' : 'Learn about app access'}
            </button>
          </div>

        </div>


       
          {showPermissions && (
            <div className="permissions-info">
              <h3>How We Use Google Services</h3>
              <p>To provide you with the best experience, our app interacts with your Google account in the following ways:</p>
              <ul>
                <li>
                  <strong>View your Google Calendar:</strong> We display your existing events so you can easily see your schedule. We never modify or create events without your explicit action.
                </li>
                <li>
                  <strong>Access Google Directory:</strong> This allows you to search for and view the calendars of other people in your organization, making it easier to find common available time slots.
                </li>
                <li>
                  <strong>See your basic profile info:</strong> We use your name and email to personalize your experience within the app. We don't modify your profile or send emails on your behalf.
                </li>
              </ul>
              <p>We value your privacy. We only access the minimum information necessary for the app to function, and we never store or share your personal data.</p>
            </div>
          )}
       
      </main>

      <footer>
        <a
          href="https://github.com/yourusername/your-repo"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </footer>

      <style jsx>{`

.action-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f0f4f8;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          color: #0070f3;
          text-decoration: none;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
          color: #333;
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 900px;
          margin: 3rem 0;
        }

        .step {
          flex: 1;
          padding: 1.5rem;
          text-align: center;
          height: 200px; /* Adjust this value as needed */
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        
        .step h3 {
          margin-bottom: 1rem;
        }
        
        .step p {
          flex-grow: 1;
          display: flex;
          align-items: center;
        }

        .step-number {
          background-color: #0070f3;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 1rem;
          font-weight: bold;
        }

        

        .step-arrow {
          margin: 0 1rem;
          color: #0070f3;
        }

        .signin-container {
          margin-bottom: 1rem;
        }

        .signin-button {
          background-color: #4285F4;
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 1.1rem;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .signin-button:hover {
          background-color: #357AE8;
        }

        .signin-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .permissions-section {
          text-align: center;
        }

        .toggle-permissions {
          background-color: transparent;
          border: none;
          color: #0070f3;
          padding: 10px 15px;
          font-size: 1rem;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }


        .toggle-permissions:hover {
          opacity: 0.7;
        }

        .permissions-info {
          margin-top: 2rem;
          padding: 1rem;
          background-color: #f0f4f8;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .permissions-info h3 {
          margin-top: 0;
          color: #333;
        }

        .permissions-info ul {
          padding-left: 20px;
        }

        .permissions-info li {
          margin-bottom: 10px;
        }

        @media (max-width: 768px) {
          .steps-container {
            flex-direction: column;
          }
          
          .step-arrow {
            transform: rotate(90deg);
            margin: 1rem 0;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}