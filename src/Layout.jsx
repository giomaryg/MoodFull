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
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#FAFCFB] pointer-events-none">
        {/* Animated Aurora Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C1D7D0] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob" style={{animationDuration: "25s"}}></div>
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#E6DDF2] rounded-full mix-blend-multiply filter blur-[150px] opacity-40 animate-blob" style={{animationDelay: "3s", animationDuration: "30s"}}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] bg-[#DCEAF5] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob" style={{animationDelay: "6s", animationDuration: "28s"}}></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-[#FCF5E3] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{animationDelay: "9s", animationDuration: "22s"}}></div>
        
        {/* Subtle Organic Noise Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.15] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilterLayout">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterLayout)"/>
        </svg>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        @import url('https://fonts.cdnfonts.com/css/brittany-signature');

        * {
          font-family: 'Poppins', sans-serif;
        }
        
        .font-mono {
          font-family: 'DM Mono', monospace !important;
        }

        .text-gradient {
          background: linear-gradient(135deg, #7A9F87 0%, #A29BE3 50%, #89B6D9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .glass-panel:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .glass-header {
          background: rgba(250, 252, 251, 0.6);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
        }
        
        /* Shimmering button */
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to bottom right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(45deg);
          animation: shimmer 3s infinite linear;
        }

        /* AI Recommendation Glow */
        .ai-glow {
          box-shadow: 0 0 20px rgba(162, 155, 227, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.8);
        }

        @keyframes shimmer {
          0% { transform: translate(-50%, -50%) rotate(45deg); }
          100% { transform: translate(50%, 50%) rotate(45deg); }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 15s infinite alternate;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
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