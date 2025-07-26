import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Int "mo:base/Int"; // Added the missing Int import

actor FraudDetection {
  // Define the type for vote
  public type Vote = {
    fraudulent : Bool; // true if the call is fraudulent
    legitimate : Bool; // true if the call is legitimate
  };

  // Type for storing call data with votes
  public type CallData = {
    id : Text;
    votes : List.List<Vote>;
  };

  // Stable variable to persist data across upgrades
  private stable var callEntriesStable : [(Text, List.List<Vote>)] = [];

  // HashMap for efficient lookups
  private var callsVotes = HashMap.HashMap<Text, List.List<Vote>>(
    10,
    Text.equal,
    Text.hash,
  );

  // System initialization
  system func preupgrade() {
    callEntriesStable := Iter.toArray(callsVotes.entries());
  };

  system func postupgrade() {
    callsVotes := HashMap.fromIter<Text, List.List<Vote>>(
      Iter.fromArray(callEntriesStable),
      10,
      Text.equal,
      Text.hash,
    );
    callEntriesStable := [];
  };

  // Function to add a new vote for a specific call
  public func addVote(callId : Text, fraudulent : Bool, legitimate : Bool) : async Text {
    let newVote : Vote = {
      fraudulent = fraudulent;
      legitimate = legitimate;
    };

    // Get current votes for this call ID, or empty list if none exist
    let currentVotes = switch (callsVotes.get(callId)) {
      case (null) { List.nil<Vote>() };
      case (?existingVotes) { existingVotes };
    };

    // Add the new vote to the list
    let updatedVotes = List.push(newVote, currentVotes);
    callsVotes.put(callId, updatedVotes);

    return "Vote successfully recorded for call ID: " # callId;
  };

  // Function to check the aggregated result of votes for a given call
  public func checkVoteResult(callId : Text) : async Text {
    switch (callsVotes.get(callId)) {
      case (null) { return "Call ID not found." };
      case (?votes) {
        let votesList = List.toArray(votes);

        if (Array.size(votesList) == 0) {
          return "No votes recorded for this call.";
        };

        var fraudCount = 0;
        var legitCount = 0;

        for (vote in votesList.vals()) {
          if (vote.fraudulent) { fraudCount += 1 };
          if (vote.legitimate) { legitCount += 1 };
        };

        if (fraudCount > legitCount) {
          return "This call is determined to be fraudulent based on " # Int.toText(Array.size(votesList)) # " votes.";
        } else if (legitCount > fraudCount) {
          return "This call is determined to be legitimate based on " # Int.toText(Array.size(votesList)) # " votes.";
        } else {
          return "No clear determination. Equal votes for fraudulent and legitimate (" # Int.toText(fraudCount) # " each).";
        };
      };
    };
  };

  // Get all votes for a specific call
  public query func getVotes(callId : Text) : async ?[Vote] {
    switch (callsVotes.get(callId)) {
      case (null) { null };
      case (?votes) { ?List.toArray(votes) };
    };
  };

  // Get all call IDs in the system
  public query func getAllCallIds() : async [Text] {
    Iter.toArray(callsVotes.keys());
  };

  // Clear all recorded votes
  public func clearAllVotes() : async Text {
    callsVotes := HashMap.HashMap<Text, List.List<Vote>>(
      10,
      Text.equal,
      Text.hash,
    );
    return "All votes cleared.";
  };

  // Clear votes for a specific call
  public func clearCallVotes(callId : Text) : async Text {
    switch (callsVotes.get(callId)) {
      case (null) { return "Call ID not found." };
      case (_) {
        callsVotes.delete(callId);
        return "Votes for call ID: " # callId # " have been cleared.";
      };
    };
  };
};
