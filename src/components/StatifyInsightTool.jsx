import React, { useState } from 'react';
import { aiInsightsAPI } from '../api/api';

const StatifyInsightTool = ({ userId }) => {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]); // Chunks/Insights store karne ke liye
    const [status, setStatus] = useState("");     // "Thinking...", "Executing SQL..." dikhane ke liye
    const [loading, setLoading] = useState(false);
    
    const handleAskAI = async () => {
        if (!question.trim()) return;
        setLoading(true);
        setMessages([]); // Reset previous response
        setStatus("Connecting...");
        
        try {
            aiInsightsAPI.streamResponse(
                question,
                userId,
                // onMessage - handles insight events
                (data) => {
                    setMessages([data]); // Word-by-word UI update
                },
                // onError
                (error) => {
                    setStatus("Error: " + error.message);
                    setLoading(false);
                },
                // onDone
                () => {
                    setStatus("Completed");
                    setLoading(false);
                },
                // onStatus - handles stage events
                (statusText) => {
                    setStatus(statusText); // UI par message dikhayein: "Thinking...", "Running SQL..."
                }
            );
        } catch (err) {
            console.error("Streaming error:", err);
            setStatus("Disconnected");
            setLoading(false);
        }
    };
    
    return (
        <div className="p-4 border rounded-lg shadow-lg">
            <input 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something about your data..."
                className="w-full p-2 border rounded"
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAskAI();
                    }
                }}
            />
            <button 
                onClick={handleAskAI} 
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? "Generating..." : "Get Insights"}
            </button>
            
            {/* Status bar (Thinking/SQL info) */}
            <div className="mt-4 text-sm italic text-gray-500">{status}</div>
            
            {/* Final Markdown/Text Response */}
            <div className="mt-2 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                {messages[0]}
            </div>
        </div>
    );
};

export default StatifyInsightTool;
