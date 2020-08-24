import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Parser from './Parser'
import Player from './Player';
import { TRACK1, TRACK2, TRACK3 } from './testmml';

class App extends Component {
  clickChild1 = ()  => {}
  clickChild2 = ()  => {}
  clickChild3 = ()  => {}

  constructor(props: any) {
    super(props);
  }

  render() {
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
          <Player text="test" track="1" mml={ TRACK1 } setClick={ (clickFunc: any) => this.clickChild1 = clickFunc }/>
          <Player text="test" track="2" mml={ TRACK2 } setClick={ (clickFunc: any) => this.clickChild2 = clickFunc }/>
          <Player text="test" track="3" mml={ TRACK3 } setClick={ (clickFunc: any) => this.clickChild3 = clickFunc }/>
          <button onClick={() => { this.clickChild1(); this.clickChild2(); this.clickChild3();} }> Play All </button>
        </header>
      </div>
    );
  }
}

export default App;
