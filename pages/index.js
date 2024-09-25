import { signIn, signOut, useSession } from "next-auth/react"
import Head from 'next/head'
import { useState } from 'react'
import CalendarView from '../components/CalendarView'

export default function Home() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  if (session) {
    return <CalendarView />
  }

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn("google")
    setIsLoading(false)
  }

  return (
    <div className="container">
      <Head>
        <title>Calendar Availability App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">Welcome to Calendar Availability</h1>
        
        <p className="description">
          Easily manage and share your available time slots
        </p>

        <div className="grid">
          <div className="card">
            <h3>View Your Calendar</h3>
            <p>See all your events in one place with our intuitive calendar interface.</p>
          </div>

          <div className="card">
            <h3>Select Available Slots</h3>
            <p>Quickly mark times when you're free for meetings or appointments.</p>
          </div>

          <div className="card">
            <h3>Share Availability</h3>
            <p>Generate a shareable list of your available time slots in any timezone.</p>
          </div>
        </div>

        <div className="signin-container">
          <button onClick={handleSignIn} disabled={isLoading} className="signin-button">
            {isLoading ? 'Signing In...' : 'Sign in with Google'}
          </button>
        </div>
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
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          background-color: white;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .signin-container {
          margin-top: 2rem;
        }

        .signin-button {
          background-color: #4285F4;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 1rem;
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

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
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