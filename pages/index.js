import { signIn, signOut, useSession } from "next-auth/react"
import Head from 'next/head'
import { useState } from 'react'
import CalendarView from '../components/CalendarView'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const GoogleSignInButton = ({ onClick, isLoading }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={isLoading} 
      className="google-signin-button"
    >
      <svg className="google-logo" width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285f4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34a853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
        <path fill="#fbbc05" d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71c0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#ea4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0C5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
      </svg>
      <span className="button-text">
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </span>
    </button>
  );
};

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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>

        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <main>
      <div className="logo-container">
    <svg viewBox="0 0 200 200" className="logo">
      {/* Background Calendar */}
      <rect x="45" y="45" width="80" height="100" fill="#4285f4" rx="8"/>
      <rect x="45" y="45" width="80" height="22" fill="#3367d6" rx="8"/>
      <rect x="58" y="35" width="6" height="20" fill="#3367d6" rx="2"/>
      <rect x="106" y="35" width="6" height="20" fill="#3367d6" rx="2"/>
      
      {/* Foreground Calendar */}
      <rect x="75" y="65" width="80" height="100" fill="#34a853" rx="8" opacity="0.95"/>
      <rect x="75" y="65" width="80" height="22" fill="#288840" rx="8"/>
      <rect x="88" y="55" width="6" height="20" fill="#288840" rx="2"/>
      <rect x="136" y="55" width="6" height="20" fill="#288840" rx="2"/>
    </svg>
  </div>
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

        <button onClick={handleSignIn} disabled={isLoading} className="gsi-material-button">
    <div className="gsi-material-button-state"></div>
    <div className="gsi-material-button-content-wrapper">
      <div className="gsi-material-button-icon">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{display: 'block'}}>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          <path fill="none" d="M0 0h48v48H0z"></path>
        </svg>
      </div>
      <span className="gsi-material-button-contents">
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </span>
      <span style={{display: 'none'}}>Sign in with Google</span>
    </div>
  </button>

          {/* <div className="signin-container">
            <button onClick={handleSignIn} disabled={isLoading} className="signin-button">
              {isLoading ? 'Signing In...' : 'Get Started - Sign in with Google'}
            </button>
          </div> */}

          {/* <div className="permissions-section">
            <button onClick={togglePermissions} className="toggle-permissions">
              {showPermissions ? 'Hide app access details' : 'Learn about app access'}
            </button>
          </div> */}

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
      <Link href="/privacy-policy" className="footer-link">
    Privacy Policy
  </Link>
        {/* <a
          href="https://github.com/yourusername/your-repo"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a> */}
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
          gap: 2rem;
        }
        
        .footer-link {
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }
        
        .footer-link:hover {
          color: #0070f3;
          text-decoration: underline;
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

        .logo-container {
          margin-bottom: 2rem;
        }
      
        .logo {
          width: 120px;
          height: 120px;
          transition: transform 0.3s ease;
        }
      
        .logo:hover {
          transform: scale(1.05);
        }
      
        @media (max-width: 600px) {
          .logo {
            width: 80px;
            height: 80px;
          }
        }

        .gsi-material-button {
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          -webkit-appearance: none;
          background-color: WHITE;
          background-image: none;
          border: 1px solid #747775;
          -webkit-border-radius: 4px;
          border-radius: 4px;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          color: #1f1f1f;
          cursor: pointer;
          font-family: 'Roboto', arial, sans-serif;
          font-size: 14px;
          height: 40px;
          letter-spacing: 0.25px;
          outline: none;
          overflow: hidden;
          padding: 0 12px;
          position: relative;
          text-align: center;
          -webkit-transition: background-color .218s, border-color .218s, box-shadow .218s;
          transition: background-color .218s, border-color .218s, box-shadow .218s;
          vertical-align: middle;
          white-space: nowrap;
          width: auto;
          max-width: 400px;
          min-width: min-content;
        }
      
        .gsi-material-button .gsi-material-button-icon {
          height: 20px;
          margin-right: 12px;
          min-width: 20px;
          width: 20px;
        }
      
        .gsi-material-button .gsi-material-button-content-wrapper {
          -webkit-align-items: center;
          align-items: center;
          display: flex;
          -webkit-flex-direction: row;
          flex-direction: row;
          -webkit-flex-wrap: nowrap;
          flex-wrap: nowrap;
          height: 100%;
          justify-content: space-between;
          position: relative;
          width: 100%;
        }
      
        .gsi-material-button .gsi-material-button-contents {
          -webkit-flex-grow: 1;
          flex-grow: 1;
          font-family: 'Roboto', arial, sans-serif;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: top;
        }
      
        .gsi-material-button .gsi-material-button-state {
          -webkit-transition: opacity .218s;
          transition: opacity .218s;
          bottom: 0;
          left: 0;
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
        }
      
        .gsi-material-button:disabled {
          cursor: default;
          background-color: #ffffff61;
          border-color: #1f1f1f1f;
        }
      
        .gsi-material-button:disabled .gsi-material-button-contents {
          opacity: 38%;
        }
      
        .gsi-material-button:disabled .gsi-material-button-icon {
          opacity: 38%;
        }
      
        .gsi-material-button:not(:disabled):active .gsi-material-button-state,
        .gsi-material-button:not(:disabled):focus .gsi-material-button-state {
          background-color: #303030;
          opacity: 12%;
        }
      
        .gsi-material-button:not(:disabled):hover {
          -webkit-box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
          box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
        }
      
        .gsi-material-button:not(:disabled):hover .gsi-material-button-state {
          background-color: #303030;
          opacity: 8%;
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