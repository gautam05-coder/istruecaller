import { useState, useEffect } from 'react';
import { isTrueCaller_backend } from '../../../declarations/isTrueCaller_backend/index'
import "./test.css"

function Detect() {

    // States for the application
  const [callId, setCallId] = useState('');
  const [result, setResult] = useState('');
  const [callIds, setCallIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState('');
  const [callDetails, setCallDetails] = useState(null);

  // Load all call IDs when component mounts
  useEffect(() => {
    fetchAllCallIds();
  }, []);

  // Function to fetch all call IDs
  const fetchAllCallIds = async () => {
    try {
      setLoading(true);
      const ids = await isTrueCaller_backend.getAllCallIds();
      setCallIds(ids);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching call IDs:", error);
      setLoading(false);
    }
  };

  // Handle vote submission
  const handleVoteSubmit = async (event) => {
    event.preventDefault();
    
    const isFraudulent = event.target.elements.fraudulent.checked;
    const isLegitimate = event.target.elements.legitimate.checked;
    
    if (!callId.trim()) {
      setResult("Please enter a call ID");
      return;
    }
    
    try {
      setLoading(true);
      const response = await isTrueCaller_backend.addVote(callId, isFraudulent, isLegitimate);
      setResult(response);
      setLoading(false);
      
      // Refresh the list of call IDs
      fetchAllCallIds();
    } catch (error) {
      console.error("Error submitting vote:", error);
      setResult("Error submitting your vote");
      setLoading(false);
    }
  };

  // Check vote result for a call ID
  const checkVoteResult = async () => {
    if (!callId.trim()) {
      setResult("Please enter a call ID");
      return;
    }
    
    try {
      setLoading(true);
      const response = await isTrueCaller_backend.checkVoteResult(callId);
      setResult(response);
      setLoading(false);
    } catch (error) {
      console.error("Error checking vote result:", error);
      setResult("Error retrieving results");
      setLoading(false);
    }
  };

  // Handle viewing call details
  const viewCallDetails = async (id) => {
    try {
      setLoading(true);
      setSelectedCallId(id);
      const votes = await isTrueCaller_backend.getVotes(id);
      if (votes) {
        const result = await isTrueCaller_backend.checkVoteResult(id);
        setCallDetails({
          id,
          votes,
          result
        });
      } else {
        setCallDetails({ id, votes: [], result: "No votes found" });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching call details:", error);
      setLoading(false);
    }
  };

  // Clear votes for a specific call
  const clearCallVotes = async (id) => {
    try {
      setLoading(true);
      await isTrueCaller_backend.clearCallVotes(id);
      setResult(`Votes for call ID ${id} cleared successfully`);
      setCallDetails(null);
      fetchAllCallIds();
      setLoading(false);
    } catch (error) {
      console.error("Error clearing votes:", error);
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto p-4">
      
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold">Fraud Call Detection System</h1>
        <p className="text-gray-600">Report and detect fraudulent calls with community voting</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Submit votes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Submit Vote</h2>
          
          <form onSubmit={handleVoteSubmit}>
            <div className="mb-4">
              <label htmlFor="callId" className="block mb-1">Call ID:</label>
              <input 
                id="callId" 
                type="text" 
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                className="w-full p-2 border rounded" 
                placeholder="Enter unique call identifier"
              />
            </div>
            
            <div className="mb-4">
              <p className="mb-2">Vote Classification:</p>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" id="fraudulent" name="fraudulent" className="mr-2" />
                  Fraudulent
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" id="legitimate" name="legitimate" className="mr-2" />
                  Legitimate
                </label>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                type="submit" 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={loading}
              >
                Submit Vote
              </button>
              
              <button 
                type="button" 
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                onClick={checkVoteResult}
                disabled={loading}
              >
                Check Result
              </button>
            </div>
          </form>
          
          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p>{result}</p>
            </div>
          )}
        </div>
        
        {/* Right column - Call listings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Reported Calls</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : callIds.length === 0 ? (
            <p>No calls reported yet</p>
          ) : (
            <div>
              <ul className="mb-4">
                {callIds.map(id => (
                  <li key={id} className="border-b py-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{id}</span>
                      <button 
                        onClick={() => viewCallDetails(id)}
                        className="text-blue-500 hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Selected call details */}
          {callDetails && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <div className="flex justify-between">
                <h3 className="font-semibold">Call ID: {callDetails.id}</h3>
                <button 
                  onClick={() => clearCallVotes(callDetails.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Clear Votes
                </button>
              </div>
              
              <p className="my-2 font-medium">{callDetails.result}</p>
              
              <div className="mt-2">
                <h4 className="text-sm font-semibold">Vote Breakdown:</h4>
                {callDetails.votes && callDetails.votes.length > 0 ? (
                  <ul className="text-sm">
                    {callDetails.votes.map((vote, index) => (
                      <li key={index} className="mt-1">
                        Vote #{index + 1}: 
                        {vote.fraudulent ? " Fraudulent" : ""}
                        {vote.legitimate ? " Legitimate" : ""}
                        {!vote.fraudulent && !vote.legitimate ? " Abstained" : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">No votes recorded.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Detect
