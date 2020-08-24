import React from 'react';
import * as Tone from 'tone';

function helloTone() {
  const synth = new Tone.Synth().toDestination();

  synth.triggerAttackRelease("C4", "8n");
}

function Player(props: any) {

//url example: https://sylean.github.io/ms2-mml/3MLE2MS2-soundfonts/acoustic-bass/A0.mp3

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
