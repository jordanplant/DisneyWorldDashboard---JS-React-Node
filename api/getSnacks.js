export default async function handler(req, res) {
  if (req.method === "GET") {
    const API_KEY = process.env.BIN_KEY;
    const BIN_ID = process.env.BIN_ID;
    const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

    try {
      const response = await fetch(JSONBIN_URL, {
        method: "GET",
        headers: { "X-Master-Key": API_KEY },
      });

      if (!response.ok) throw new Error("Failed to fetch snacks");

      const { record: snacks } = await response.json();
      res.status(200).json(snacks);
    } catch (error) {
      console.error("Error getting snacks:", error);
      res.status(500).json({ message: "Failed to get snacks" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
