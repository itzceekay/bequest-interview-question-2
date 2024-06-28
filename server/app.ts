import express from "express";
import cors from "cors";
import { createHash } from 'blake2';
import fs from 'fs';

const PORT = 8080;
const app = express();

interface DatabaseEntry {
  data: string;
  version: number;
}

let database: DatabaseEntry = { data: "Hello World", version: 1 };
let dataHash: string;

app.use(cors());
app.use(express.json());

// Helper functions
const hashData = (data: string) => {
  const hash = createHash('blake2b');
  hash.update(Buffer.from(data));
  return hash.digest('hex');
};

const logAction = (action: string, data: string) => {
  const logEntry = `${new Date().toISOString()} - ${action}: ${data}\n`;
  fs.appendFile('audit.log', logEntry, (err) => {
    if (err) console.error('Failed to write to audit log:', err);
  });
};

const backupData = () => {
  const backup = JSON.stringify(database);
  fs.writeFile('backup.json', backup, (err) => {
    if (err) console.error('Backup failed:', err);
  });
};

const recoverData = () => {
  fs.readFile('backup.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Recovery failed:', err);
    } else {
      database = JSON.parse(data);
    }
  });
};

// Routes
app.get("/", (req, res) => {
  res.json(database);
});

app.post("/", (req, res) => {
  const { data, dataHash: clientHash } = req.body;
  const serverHash = hashData(data);
  
  if (clientHash && clientHash !== serverHash) {
    return res.status(400).json({ error: 'Data integrity check failed' });
  }
  
  database.data = data;
  database.version++;
  dataHash = serverHash;
  
  logAction('UPDATE', data);
  backupData();
  
  res.json({ version: database.version });
});

app.post("/verify", (req, res) => {
  const currentHash = hashData(database.data);
  res.json({ verified: currentHash === dataHash });
});

// Backup data periodically
setInterval(backupData, 1000 * 60 * 60); // Every hour

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});