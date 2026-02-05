import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&display=swap');
        @import url('https://fonts.cdnfonts.com/css/brittany-signature');

        * {
          font-family: 'Italiana', serif;
          font-weight: 700;
        }
        
        p, span, li, label, td, th {
          font-weight: 600;
        }
        
        .text-xs, .text-sm {
          font-weight: 600;
        }
      `}</style>
      {children}
    </>
  );
}