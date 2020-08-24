import React, { Component } from 'react';
import * as Tone from 'tone';
import { URLMapping } from './samples/Samples';
import * as Lexer from './Lexer';
import * as Parser from './Parser';



class Player extends Component<{ mml: string, text: string, track: string }, { mml: string, text: string, track: string, samplerReady: boolean}> {
  context: any;
  sampler: any;
  notes: any;

  constructor(props: any) {
    super(props);
    this.state = {
      mml: props.mml,
      text: props.text,
      track: props.track,
      samplerReady: false,
    }
    
    this.buildSamplers  = this.buildSamplers.bind(this);
    this.helloTone      = this.helloTone.bind(this);
    this.scheduleNode   = this.scheduleNode.bind(this);
    //this.scheduleNode = this.scheduleNode.bind(this.context);
  }

  componentDidMount() {
    this.notes = Parser.parseTokens(Lexer.lexify(this.state.mml), new Parser.MMLState(4, 4));
  }

  scheduleNode(node: Parser.MMLNode, currentTime: number) {
    switch(node.getType()) {
      case Parser.MMLType.NOTE:
        let noteNode = node as Parser.Note;
        if(noteNode.noteValue === -1) {
          console.log(`scheduling rest ${ noteNode.noteLength }n`);
          return Tone.Time(`${ noteNode.noteLength }n`).toTicks();
        } else {
          console.log(`scheduling note ${ noteNode.noteValue }`);
          console.log(Tone.Ticks(currentTime).toBarsBeatsSixteenths());
          this.context.transport.schedule((time: any) => {
            this.sampler.triggerAttackRelease(Tone.Frequency(noteNode.noteValue, "midi"), `${ noteNode.noteLength }n`, time);
            //console.log("scheduling at time " + time);
            //sampler.triggerAttackRelease(Tone.Frequency(77, "midi"), "8n", time);
          }, Tone.Ticks(currentTime).toBarsBeatsSixteenths());
          //console.log(Tone.Time(`{ noteNode.noteLength }n`).toSeconds());
          return Tone.Time(`${ noteNode.noteLength }n`).toTicks();
          //`(Note ${ noteNode.noteValue } ${ noteNode.noteLength }${ noteNode.dotted ? " DOT" : "" })`;
        }
      case Parser.MMLType.TEMPO:
        console.log("scheduling tempo");
        let tempoNode = node as Parser.Tempo;
         Tone.Transport.schedule((time: any) => {
           Tone.Transport.bpm.value = tempoNode.tempoValue;
         }, Tone.Ticks(currentTime).toBarsBeatsSixteenths());
        return 0;
      case Parser.MMLType.VOLUME:
        console.log("scheduling volume");
        let volumeNode = node as Parser.Volume;
        Tone.Transport.schedule((time: any) => {
          this.sampler.volume.value = volumeNode.volumeValue
        }, Tone.Ticks(currentTime).toBarsBeatsSixteenths());
        return 0;
      default:
        return 0;
    }
  }
  
  scheduleNodes(nodes: Array<Parser.MMLNode>): void {
    var currentTime = 0;
    for(var node of nodes) {
      var returnValue = this.scheduleNode(node, currentTime);
      //console.log("return" + returnValue);
      if(returnValue !== 0) {
        currentTime += returnValue;
      } 
    }
  }

  async buildSamplers() {
    await Tone.start();

    this.context = new Tone.Context();

    this.context.debug = true;

    this.sampler = new Tone.Sampler({
      urls: URLMapping,
      baseUrl: "https://sylean.github.io/ms2-mml/3MLE2MS2-soundfonts/harmonica/",
      onload: () => {
        this.setState({ samplerReady: true });
      },
      context: this.context,
    }).toDestination();

    this.context.transport.stop();
    this.context.transport.position = 0;
  
    this.scheduleNodes(this.notes);
  }

  async helloTone() {
    console.log(`This: ${this}`);
    this.context.transport.start();
  }

  render() {
    return(
    <div>
      This is track { this.state.track }
      <button onClick={ this.buildSamplers } >
        { this.state.text }
      </button>
      <button onClick={ this.helloTone } disabled={!this.state.samplerReady}>
        START
      </button>
    </div>
    );
  }
}

/*
function Player(props: any) {

  const [samplerReady, setSamplerReady] = useState(true);

//url example: https://sylean.github.io/ms2-mml/3MLE2MS2-soundfonts/acoustic-bass/A0.mp3

  useEffect(() => {
    sampler = new Tone.Sampler({
      urls: URLMapping,
      baseUrl: "https://sylean.github.io/ms2-mml/3MLE2MS2-soundfonts/harmonica/",
      onload: () => {
        setSamplerReady(false);
      }
    }).toDestination();

    notes = Parser.parseTokens(Lexer.lexify(props.mml), new Parser.MMLState(4, 4));
  });

  return(
    <div>
      This is track { props.track }
      <button onClick={helloTone} disabled={samplerReady}>
        { props.text }
      </button>
    </div>
  );
}
*/

export default Player;
