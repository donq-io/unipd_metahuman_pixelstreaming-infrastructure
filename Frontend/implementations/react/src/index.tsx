// Copyright Epic Games, Inc. All Rights Reserved.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<App />);
  }
