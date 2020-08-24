import React, { Component } from 'react';
import * as Tone from 'tone';
import { URLMapping } from './samples/Samples';
import * as Lexer from './Lexer';
import * as Parser from './Parser';



class Player extends Component<{ mml: string, text: string, track: string, setClick: any }, { mml: string, text: string, track: string, samplerReady: boolean}> {
  context: any;
  sampler: any;
  notes: any;
  transport: any;

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

    this.props.setClick(this.helloTone);
  }

  scheduleNode(node: Parser.MMLNode, currentTime: number) {
    switch(node.getType()) {
      case Parser.MMLType.NOTE:
        let noteNode = node as Parser.Note;
        if(noteNode.noteValue === -1) {
          return Tone.Time(`${ noteNode.noteLength }n${ noteNode.dotted? "." : ""}`).toTicks();
        } else {
          this.transport.schedule((time: any) => {
            this.sampler.triggerAttackRelease(Tone.Frequency(noteNode.noteValue, "midi"), `${ noteNode.noteLength }n${ noteNode.dotted? "." : ""}`, time);
            console.log(this.transport.bpm.value);
          }, Tone.Ticks(currentTime).toBarsBeatsSixteenths());
          return Tone.Time(`${ noteNode.noteLength }n${ noteNode.dotted? "." : ""}`).toTicks();
        }
      case Parser.MMLType.TEMPO:
        let tempoNode = node as Parser.Tempo;
         this.transport.schedule((time: any) => {
           this.transport.bpm.value = tempoNode.tempoValue;
         }, Tone.Ticks(currentTime).toBarsBeatsSixteenths());
        return 0;
      case Parser.MMLType.VOLUME:
        let volumeNode = node as Parser.Volume;
        this.transport.schedule((time: any) => {
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

    this.transport = this.context.transport;

    this.sampler = new Tone.Sampler({
      urls: URLMapping,
      baseUrl: "https://sylean.github.io/ms2-mml/3MLE2MS2-soundfonts/harmonica/",
      onload: () => {
        this.setState({ samplerReady: true });
      },
      context: this.context,
    }).connect(this.context.destination);

    this.scheduleNodes(this.notes);
  }

  async helloTone() {
    console.log(`This: ${this}`);
    this.transport.stop();
    this.transport.position = 0;
    this.transport.start();
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

export default Player;
