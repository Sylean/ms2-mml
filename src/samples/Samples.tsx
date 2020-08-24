import * as Tone from 'tone';

const AcousticGuitar = new Tone.Sampler({
  urls: {
    A0: "A0.mp3",
    A1: "A1.mp3",
  },
  baseUrl: "https://sylean.github.io/ms2-mml/3MLE2MS2-soundfonts/acoustic-bass/",
  onload: () => {
    sampler.triggerAttackRelease(["A0", "A1"], 0.5);
  }
}).toDestination();
