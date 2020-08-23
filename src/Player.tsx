import React from 'react';
import * as Tone from 'tone';

function helloTone() {
  const synth = new Tone.Synth().toDestination();

  synth.triggerAttackRelease("C4", "8n");
}

function Player(props: any) {


  return(
    <div>
    This is the Player
      <button onClick={helloTone}>
        { props.text }
      </button>
    </div>
  );
}

export default Player;
