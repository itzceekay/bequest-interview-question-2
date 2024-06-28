import React, { useEffect, useState } from "react";
import { createHash } from "blake2";

const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState<string>();
  const [dataVersion, setDataVersion] = useState<number>(0);


  useEffect(() => {
    getData();
  }, []);

  const hashData = (data: string) => {
    const hash = createHash('blake2b');
    hash.update(Buffer.from(data));
    return hash.digest('hex');
  };

  const getData = async () => {
    try {
      const response = await fetch(API_URL);
      const { data, version } = await response.json();
      setData(data);
      setDataVersion(version);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to fetch data. Please try again.");
    }
  };

  const updateData = async () => {
    try {
      if (data === undefined) {
        throw new Error("Data is undefined");
      }
      const dataHash = hashData(data);
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ data, dataHash }),
        headers: {
          'Accept': "application/json",
          'Content-Type': "application/json",
        },
      });
      const { version } = await response.json();
      setDataVersion(version);
      await getData();
    } catch (error) {
      console.error("Failed to update data:", error);
      alert("Failed to update data. Please try again.");
    }
  };

  const verifyData = async () => {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        body: JSON.stringify({ data }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.verified) {
        alert('Data integrity verified!');
      } else {
        alert('Data may have been tampered with!');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Verification process failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
      </div>
    </div>
  );
}

export default App;
