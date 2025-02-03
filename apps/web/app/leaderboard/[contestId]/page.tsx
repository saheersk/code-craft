"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

const RealTimeLeaderboard = () => {
  const contestId: string = useParams().contestId as string;
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    if (!contestId) return;
  
    const ws = new WebSocket("ws://localhost:4000");
  
    ws.onopen = () => {
      console.log("WebSocket connection opened");
      setTimeout(() => {
        ws.send(JSON.stringify({ type: "join:leaderboard", contestId }));
      }, 100);
    };
  
    ws.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      console.log(parsedMessage, "===message");
      setLeaderboardData(parsedMessage.leaderboard);
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  
    ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };
  
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [contestId]);

  return (
    <div className="flex-grow container mx-auto mt-5 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Real-Time Leaderboard
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user: any, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
              >
                <td className="px-4 py-2 font-medium">{index + 1}</td>
                <td className="px-4 py-2">{user.userId}</td>
                <td className="px-4 py-2">{user.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RealTimeLeaderboard;
