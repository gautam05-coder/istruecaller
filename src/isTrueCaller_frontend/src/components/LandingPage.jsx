import React from 'react'
import "./LandingPage.css";
 import IMG from "../../public/fraudcall.png"

function LandingPage() {
    const handleRedirect = ()=>{
        window.location.href = "/detect";
    };
  return (
    <div className="container">
      <div className="card">
        
        <h1 className="title">Fraud Call Detection</h1>

        <div className="icon">+</div>

        <p className="description">
          Every day, millions fall victim to scam calls, risking financial loss and personal data breaches.Our Fraud Call Detection 
          System analyzes call patterns, detects potential spam,and alerts user in real-time. We aim to eliminate phone scams 
          before they reach you!
        </p>

        {/* Image Section */}
        <div className="image-container">
          <img
            src={IMG}
            alt=" "
            className="image"
          />
        </div>

        {/* Button */}
        <button onClick={handleRedirect} className="small-button">detect</button>
      </div>
    </div>
  );
};

 
export default LandingPage
