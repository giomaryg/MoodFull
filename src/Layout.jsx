import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        * {
          font-family: 'Syne', sans-serif;
        }
        
        .font-mono {
          font-family: 'DM Mono', monospace !important;
        }

        body {
          background-color: #e8f0ea; /* --green-lt */
          color: #3d5244;
        }

        .text-gradient {
          background: linear-gradient(135deg, #3d5244 30%, #6b9b76 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-panel {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(197,217,201,0.5);
          border-radius: 14px;
        }
        
        .glass-header {
          background: rgba(232,240,234,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(197,217,201,0.5);
        }
      `}</style>
      {children}
    </>
  );
}