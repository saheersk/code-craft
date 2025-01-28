"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

const RealTimeLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const { contestId } = useParams<{ contestId: string }>(); // Retrieve contestId from URL params

  console.log(leaderboard);
  console.log(contestId);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    // When the WebSocket is open, send the contestId request
    ws.onopen = () => {
      ws.send(
        JSON.stringify({ event: "request-leaderboard", contestId: contestId })
      );
    };

    // Listen for incoming messages from the WebSocket server
    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.event === "leaderboard-data") {
        setLeaderboard(data.data.leaderboard); // Update leaderboard state
      }
    };

    // Clean up WebSocket connection on unmount
    return () => {
      ws.close();
    };
  }, [contestId]); // Reconnect when the contestId changes

  return (
    <div className="flex-grow container mx-auto mt-5 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Real-Time Leaderboard</h1>
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
            {leaderboard.map((user, index) => (
              <tr key={index} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
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
