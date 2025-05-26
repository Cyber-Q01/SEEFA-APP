import React from 'react';
import ReactDOM from 'react-dom/client';

// This React component will render into the #root div in index.html
// It's a placeholder because the main application is React Native / Expo.
const WebPlaceholder: React.FC = () => {
  return (
    // The content is now primarily in index.html for simplicity.
    // This React part ensures the div#root is utilized as expected by some platforms.
    null 
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <WebPlaceholder />
  </React.StrictMode>
);

console.info(
  "This is the web entry point for the SEEFA Expo React Native application. " +
  "The main application is designed for mobile (iOS/Android). " +
  "To run the app, please use 'npx expo start' and open it on a simulator or a physical device via the Expo Go app."
);