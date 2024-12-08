import { getSession } from "next-auth/react";
import { google } from "googleapis";



export default async function handler(req, res) {
  console.log("API Request Headers:", {
    cookie: req.headers.cookie,
    host: req.headers.host,
    origin: req.headers.origin,
    referer: req.headers.referer
  });

  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  console.log("Current hostname:", req.headers.host);

  const session = await getSession({ req });
  
  console.log("Session check result:", {
    hasSession: !!session,
    sessionDetails: session ? {
      hasUser: !!session.user,
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

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    console.log('OAuth client setup complete');

    const { start, end, emails } = req.query;
    if (!start || !end || !emails) {
      return res.status(400).json({ error: "Missing required query parameters" });
    }

    console.log('Request params:', { start, end, emails });

    const emailList = emails.split(',');
    let allEvents = [];

    for (const userEmail of emailList) {
      console.log(`Fetching calendar for ${userEmail}`);
      
      try {
        const response = await calendar.events.list({
          calendarId: userEmail,
          timeMin: start,
          timeMax: end,
          singleEvents: true,
          orderBy: "startTime",
        });
        
        console.log(`Calendar response status for ${userEmail}:`, response.status);

        if (!response.data.items) {
          console.log(`No events found for ${userEmail}`);
          continue;
        }

        const events = response.data.items
          .filter(event => event.transparency !== "transparent")
          .map((event) => ({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            email: userEmail,
            allDay: !event.start.dateTime,
            description: event.description,
            status: event.status,
            transparency: event.transparency,
            visibility: event.visibility,
          }));

        console.log(`Processed ${events.length} events for ${userEmail}`);
        allEvents = [...allEvents, ...events];
      } catch (calendarError) {
        console.error(`Error fetching calendar for ${userEmail}:`, {
          message: calendarError.message,
          code: calendarError.code,
          errors: calendarError.errors
        });
        
        if (calendarError.code === 401) {
          return res.status(401).json({ 
            error: "Calendar access unauthorized",
            details: "Token may have expired"
          });
        }
        
        // Continue with other calendars even if one fails
        continue;
      }
    }

    console.log(`Successfully fetched ${allEvents.length} total events`);
    res.status(200).json(allEvents);

  } catch (error) {
    console.error('API Route - Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data
    });
    
    if (error.code === 401 || error.message?.includes('auth')) {
      return res.status(401).json({ 
        error: "Authentication failed",
        details: error.message 
      });
    }

    res.status(500).json({ 
      error: "Failed to fetch calendar events",
      details: error.message
    });
  }
}