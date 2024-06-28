import express from "express";
import cors from "cors";
import SHA256 from 'crypto-js/sha256';
import fs from 'fs';

const PORT = 8080;
const app = express();

interface DatabaseEntry {
  data: string;
  version: number;
}

// default data
let database: DatabaseEntry = { data: "Hello World", version: 1 };
let dataHash: string;

app.use(cors());
app.use(express.json());


const hashData = (data: string) => {
  return SHA256(data).toString();
};

// helper function to log
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
  
  // log the action and create a backup
  logAction('UPDATE', data);
  backupData();
  
  res.json({ version: database.version });
});

app.post("/verify", (req, res) => {
  const currentHash = hashData(database.data);
  res.json({ verified: currentHash === dataHash });
});

// backup data periodically
setInterval(backupData, 5000); // every 5 sec

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  // recover data from the latest backup on server start
  recoverData();
});