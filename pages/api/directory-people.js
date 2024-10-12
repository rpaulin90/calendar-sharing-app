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

  const people = google.people({ version: 'v1', auth: oauth2Client });

  try {
    const { search } = req.query;
    
    if (!search || search.length < 3) {
      return res.status(200).json({ people: [] });
    }

    const response = await people.people.searchDirectoryPeople({
      readMask: 'names,emailAddresses',
      sources: ['DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'],
      pageSize: 30,
      query: search,
      mergeSources: 'DIRECTORY_MERGE_SOURCE_TYPE_CONTACT'
    });

    if (!response.data.people) {
      console.log("No people found in the response");
      return res.status(200).json({ people: [] });
    }

    const directoryPeople = response.data.people.map((person) => ({
      name: person.names && person.names[0] ? person.names[0].displayName : "No Name",
      email: person.emailAddresses && person.emailAddresses[0] ? person.emailAddresses[0].value : "No Email",
    }));

    console.log(`Found ${directoryPeople.length} directory people`);

    res.status(200).json({
      people: directoryPeople,
      nextPageToken: response.data.nextPageToken
    });
  } catch (error) {
    console.error("Error searching directory people:", error);
    res.status(500).json({ error: "Error searching directory people", details: error.message });
  }
}