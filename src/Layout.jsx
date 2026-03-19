import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    if (currentPageName) {
      base44.analytics.track({
        eventName: "app_opened",
        properties: { page_name: currentPageName }
      });
    }
  }, [currentPageName]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        @import url('https://fonts.cdnfonts.com/css/brittany-signature');

        * {
          font-family: 'Syne', sans-serif;
        }
        
        .font-mono {
          font-family: 'DM Mono', monospace !important;
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

        .s1-orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(107,155,118,0.15);
        }
        @keyframes orbit-spin { to { transform: rotate(360deg); } }
        .orbit-anim { animation: orbit-spin 12s linear infinite; }
        .orbit-anim-rev { animation: orbit-spin 18s linear infinite reverse; }

        .s1-corner {
          position: absolute;
          width: 14px; height: 14px;
          border-color: rgba(107,155,118,0.4);
          border-style: solid;
        }

        .nav-dot {
          position: absolute;
          bottom: -2px; left: 50%;
          transform: translateX(-50%);
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #6b9b76;
          box-shadow: 0 0 5px rgba(107,155,118,0.7);
        }
      `}</style>
      {children}
    </>
  );
}