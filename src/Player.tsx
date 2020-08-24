import React,  { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { URLMapping } from './samples/Samples';

var sampler: any;

async function helloTone() {
  //const synth = new Tone.Synth().toDestination();

  //synth.triggerAttackRelease("C4", "8n");

  await Tone.start();

  

  const loopA = new Tone.Loop(time => {
    sampler.triggerAttackRelease(Tone.Frequency(77, "midi"), "8n", time);
  }, "4n").start(0);

  Tone.Transport.start();
}



function Player(props: any) {

  const [samplerReady, setSamplerReady] = useState(true);

//url example: https://sylean.github.io/ms2-mml/3MLE2MS2-soundfonts/acoustic-bass/A0.mp3

  useEffect(() => {
    sampler = new Tone.Sampler({
      urls: URLMapping,
      baseUrl: "https://sylean.github.io/ms2-mml/3MLE2MS2-soundfonts/acoustic-bass/",
      onload: () => {
        setSamplerReady(false);
      }
    }).toDestination();
  });

  return(
    <div>
    This is the Player
      <button onClick={helloTone} disabled={samplerReady}>
        { props.text }
      </button>
    </div>
  );
}

export default Player;
