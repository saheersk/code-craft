"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

const RealTimeLeaderboard = () => {
  const contestId: string = useParams().contestId;
  console.log(contestId, "====contestId");
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000"); // Adjust the URL to match your WebSocket server

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      ws.send(JSON.stringify({ type: "join:leaderboard", contestId }));
    };

    ws.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      setLeaderboardData(parsedMessage.leaderboard);
    };

    return () => {
      ws.close();
    };
  }, [contestId]);

  console.log(leaderboardData, "====leaderboardData");

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
