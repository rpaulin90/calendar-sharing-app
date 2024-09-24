// pages/index.js
import { signIn, signOut, useSession } from "next-auth/react"
import CalendarView from '../components/CalendarView'

export default function Home() {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        <div>Signed in as {session.user?.email}</div>
        <button onClick={() => signOut()}>Sign out</button>
        <CalendarView />
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </>
  )
}