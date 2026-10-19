import React from 'react';
import { createRoot } from 'react-dom/client';
import Manager from '../app/manager';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Manager publicDemo /></React.StrictMode>);
