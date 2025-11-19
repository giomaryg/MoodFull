import React from 'react';
import BottomNav from './components/BottomNav';

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
      `}</style>
      {children}
      <BottomNav currentPage={currentPageName} />
    </>
  );
}