import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&display=swap');
        
        * {
          font-family: 'Italiana', serif;
          font-weight: 700;
        }
      `}</style>
      {children}
    </>
  );
}