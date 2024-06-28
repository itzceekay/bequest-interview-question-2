# Tamper Proof Data

At Bequest, we require that important user data is tamper proof. Otherwise, our system can incorrectly distribute assets if our internal server or database is breached. 

**1. How does the client ensure that their data has not been tampered with?**

The client uses SHA256 hashing to create a unique fingerprint of the data before sending it to the server.
The server verifies this hash upon receiving the data and during subsequent integrity checks, alerting the client if any discrepancies are detected.

**2. If the data has been tampered with, how can the client recover the lost data?**

The server maintains frequent backups (every 5 seconds) of the data.
If tampering is detected, the client can request the server to recover data from the most recent untampered backup.

## **Manual Testing Instructions:**

### Initial Load:
- When the page loads, you should see the initial "Hello World" data displayed
- Note the initial version number (should be 1)

### Update Data:
- Type new text into the input field
- Click the "Update Data" button
- The displayed data should update, and the version number should increment

### Verify Data:
- After updating the data, click the "Verify Data" button
- You should see an alert saying "Data integrity verified!"

### Tamper Detection:
- To simulate tampering, you can modify the data directly in the server's database object:
  - Stop the server
  - In app.ts, change the database.data value
  - Restart the server
- Now, when you click "Verify Data" in the client, you should see an alert saying "Data may have been tampered with!"

### Server Restart and Data Recovery:
- Stop the server
- Restart the server
- Refresh the client page
- The data and version should be the same as before the server restart, demonstrating successful recovery from backup

### Server Logs:
- Check the audit.log file in the server directory to verify that all update actions are being logged




### To run the apps:
```npm run start``` in both the frontend and backend

## To make a submission:
1. Clone the repo
2. Make a PR with your changes in your repo
3. Email your github repository to robert@bequest.finance
