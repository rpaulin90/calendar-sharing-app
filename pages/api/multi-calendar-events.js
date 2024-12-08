import { getSession } from "next-auth/react";
import { google } from "googleapis";

export default async function handler(req, res) {
  // Log request details
  console.log("API Request Details:", {
    method: req.method,
    query: req.query,
    headers: {
      cookie: req.headers.cookie,
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    }
  });

  console.log("Environment Check:", {
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  });

  // Get and validate session
  const session = await getSession({ req });
  
  console.log("Session check result:", {
    hasSession: !!session,
    sessionDetails: session ? {
      hasUser: !!session.user,
      userEmail: session?.user?.email,
      hasAccessToken: !!session.accessToken,
      error: session.error
    } : null
  });

  if (!session) {
    console.log("No session found");
    return res.status(401).json({ error: "No session found" });
  }

  if (!session.accessToken) {
    console.log("No access token in session");
    return res.status(401).json({ error: "No access token found" });
  }

  if (session.error) {
    console.log("Session has error:", session.error);
    return res.status(401).json({ error: session.error });
  }

  // Extract and validate query parameters
  const { start, end, emails } = req.query;
  
  if (!start || !end || !emails) {
    console.log("Missing required parameters:", { start, end, emails });
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Initialize Google OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const emailList = emails.split(',');
  
  console.log("Processing calendars for emails:", emailList);

  try {
    let allEvents = [];
    
    for (const email of emailList) {
      try {
        console.log(`Fetching calendar for ${email}`);
        
        const response = await calendar.events.list({
          calendarId: email,
          timeMin: start,
          timeMax: end,
          singleEvents: true,
          orderBy: "startTime",
        });

        console.log(`Calendar response for ${email}:`, {
          status: response.status,
          itemCount: response.data.items?.length || 0
        });

        if (response.data.items) {
          const events = response.data.items
            .filter(event => event.transparency !== "transparent")
            .map((event) => ({
              id: event.id,
              title: event.summary,
              start: event.start.dateTime || event.start.date,
              end: event.end.dateTime || event.end.date,
              email: email,
              allDay: !event.start.dateTime,
              description: event.description,
              status: event.status,
              transparency: event.transparency,
              visibility: event.visibility,
            }));

          console.log(`Processed ${events.length} events for ${email}`);
          allEvents = [...allEvents, ...events];
        }
      } catch (calendarError) {
        console.error(`Error fetching calendar for ${email}:`, {
          error: calendarError.message,
          code: calendarError.code,
          status: calendarError.response?.status,
          statusText: calendarError.response?.statusText
        });
        // Continue with other calendars even if one fails
      }
    }

    console.log(`Successfully processed ${allEvents.length} total events`);
    return res.status(200).json(allEvents);
    
  } catch (error) {
    console.error('Calendar API error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      response: error.response?.data
    });

    if (error.code === 401) {
      return res.status(401).json({ 
        error: "Access token expired",
        details: error.message 
      });
    }

    return res.status(500).json({ 
      error: "Error fetching calendar events",
      details: error.message 
    });
  }
}