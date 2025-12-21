'use client';

import { useState } from 'react';

export default function TestPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <h1>Test Page</h1>
      <button
        onClick={() => {
          console.log('Test button clicked');
          setShowModal(true);
        }}
        style={{
          backgroundColor: 'green',
          color: 'white',
          padding: '20px',
          fontSize: '18px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        TEST BUTTON
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'red',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px'
        }}>
          <div>
            <h2>TEST MODAL WORKS!</h2>
            <button
              onClick={() => setShowModal(false)}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                padding: '10px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}