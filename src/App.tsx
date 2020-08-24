import React from 'react';
import logo from './logo.svg';
import './App.css';
import Parser from './Parser'
import Player from './Player';
import { TRACK1, TRACK2, TRACK3 } from './testmml';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Parser />
        <Player text="test" track="1" mml={ TRACK1 }/>
        <Player text="test" track="2" mml={ TRACK2 }/>
        <Player text="test" track="3" mml={ TRACK3 }/>
      </header>
    </div>
  );
}

export default App;
