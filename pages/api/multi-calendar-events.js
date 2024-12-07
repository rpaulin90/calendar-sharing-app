import { getSession } from "next-auth/react";
import { google } from "googleapis";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !session.accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (session.error === "RefreshAccessTokenError") {
    return res.status(403).json({ error: "Access denied" });
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

  try {
    const { start, end, emails } = req.query;
    console.log('Request params:', { start, end, emails });
    console.log('Session status:', { 
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      tokenError: session?.error
    });

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

        allEvents = [...allEvents, ...events];
      } catch (calendarError) {
        console.error(`Error fetching calendar for ${userEmail}:`, calendarError);
        // Continue with other calendars even if one fails
      }
    }

    res.status(200).json(allEvents);
  } catch (error) {
    console.error('Calendar API error:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      name: error.name,
      response: error.response?.data
    });
    
    if (error.code === 401) {
      return res.status(401).json({ error: "Access token expired" });
    }
    res.status(500).json({ error: "Error fetching calendar events", details: error.message });
  }
}