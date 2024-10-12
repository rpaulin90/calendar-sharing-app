// pages/api/multi-calendar-events.js
import { getSession } from "next-auth/react";
import { google } from "googleapis";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !session.accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: session.accessToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    const { start, end, emails } = req.query;
    const emailList = emails.split(',');

    let allEvents = [];

    for (const email of emailList) {
      const response = await calendar.events.list({
        calendarId: email,
        timeMin: start,
        timeMax: end,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items.map((event) => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        email: email,
      }));

      allEvents = [...allEvents, ...events];
    }

    res.status(200).json(allEvents);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: "Error fetching calendar events" });
  }
}