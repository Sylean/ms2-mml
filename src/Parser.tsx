import React from 'react';
import * as Lexer from './Lexer';
import * as Tokens from './Tokens';
import { TRACK1, TRACK2, TRACK3, TESTMML, MINIMML } from './testmml';

function openFile(e: React.ChangeEvent<HTMLInputElement>) {
  var file:File = e.target.files![0];
  if(!file || e === null) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    if(e === null) {
      return;
    } else {
      var target: any = e.target;
      var contents = target.result;
      displayContents(contents);
    }
  };
  reader.readAsText(file);
}

export enum MMLType {
  NOTE = "NOTE",
  TEMPO = "TEMPO",
  VOLUME = "VOLUME"
}

export interface MMLNode {
  getType(): MMLType;
}

export class Note implements MMLNode {
  noteValue: number;
  noteLength: number;
  dotted: boolean;
  constructor(note: number, length: number, dotted: boolean) {
    this.noteValue = note;
    this.noteLength = length;
    this.dotted = dotted;
  }
  getType() {
    return MMLType.NOTE;
  }
}

function letterToMidi(note: Tokens.NoteType, octave: number): number {
  let noteNumber;
  switch(note) {
    case Tokens.NoteType.C:
      noteNumber = 0;
      break;
    case Tokens.NoteType.D:
      noteNumber = 2;
      break;
    case Tokens.NoteType.E:
      noteNumber = 4;
      break;
    case Tokens.NoteType.F:
      noteNumber = 5;
      break;
    case Tokens.NoteType.G:
      noteNumber = 7;
      break;
    case Tokens.NoteType.A:
      noteNumber = 9;
      break;
    case Tokens.NoteType.B:
      noteNumber = 11;
      break;
    default:
      throw new Error(`Invalid Note: ${ note }`);
  }

  return noteNumber + (octave * 12);
}

const placeholderNote = new Note(72, 1, false);

export class Tempo implements MMLNode {
  tempoValue: number;
  constructor(tempo: number) {
    this.tempoValue = tempo;
  }
  getType() {
    return MMLType.TEMPO;
  }
}

export class Volume implements MMLNode {
  volumeValue: number;
  constructor(volume: number) {
    this.volumeValue = volume;
  }
  getType() {
    return MMLType.VOLUME;
  }
}

export function printNode(node: MMLNode) {
  switch(node.getType()) {
    case MMLType.NOTE:
      let noteNode = node as Note;
      if(noteNode.noteValue === -1) {
        return `(Rest ${ noteNode.noteLength }${ noteNode.dotted ? " DOT" : "" })`
      } else {
        return `(Note ${ noteNode.noteValue } ${ noteNode.noteLength }${ noteNode.dotted ? " DOT" : "" })`;
      }
    case MMLType.TEMPO:
      let tempoNode = node as Tempo;
      return `(Tempo ${ tempoNode.tempoValue })`;
    case MMLType.VOLUME:
      let volumeNode = node as Volume;
      return `(Volume ${ volumeNode.volumeValue })`;
    default:
      return "Not a node???";
  }
}

export function printNodes(nodes: Array<MMLNode>) {
  return nodes.map(node => printNode(node)).join();
}

export class MMLState {
  defaultLength: number;
  defaultOctave: number;
  defaultDotted: boolean;
  constructor(length: number, octave: number) {
    this.defaultLength = length;
    this.defaultOctave = octave;
    this.defaultDotted = false;
  }
}

function parseNotePitch(tokens: Array<Tokens.MMLToken>, note: Note, state: MMLState): Array<MMLNode> {
  if(tokens[0] instanceof Tokens.FlatToken) {
    note.noteValue -= 1;
    return parseNoteLength(tokens.slice(1), note, state);
  } else if(tokens[0] instanceof Tokens.SharpToken) {
    note.noteValue += 1;
    return parseNoteLength(tokens.slice(1), note, state);
  } else if(tokens[0] === undefined) {
    return [note];
  } else {
    return parseNoteLength(tokens, note, state);
  }
}

function parseNoteLength(tokens: Array<Tokens.MMLToken>, note: Note, state: MMLState): Array<MMLNode> {
  if(tokens[0] instanceof Tokens.NumberToken) {
    let numberLength = tokens[0] as Tokens.NumberToken;
    note.noteLength = numberLength.value;
    note.dotted = false;
    return parseDot(tokens.slice(1), note, state);
  } else if(tokens[0] === undefined) {
    return [note];
  } else {
    return parseDot(tokens, note, state);
  }
}

function parseDot(tokens: Array<Tokens.MMLToken>, note: Note, state: MMLState): Array<MMLNode> {
  if(tokens[0] instanceof Tokens.DotToken) {
    note.dotted = true;
    //Add tie parsing here later too
    return [note, ...parseTokens(tokens.slice(1), state)];
  } else if(tokens[0] === undefined) {
    return [note];
  } else {
    //Add tie parsing here later
    return [note, ...parseTokens(tokens, state)];
  }
}

function parseNote(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(!(tokens[0] instanceof Tokens.LetterNoteToken || tokens[0] instanceof Tokens.MidiNoteToken)) {
    throw new Error(`Unexpected Note Tokens: ${ Tokens.printToken(tokens[0]) }`);
  } else if(tokens[0] instanceof Tokens.LetterNoteToken) {
    let letterValue = tokens[0] as Tokens.LetterNoteToken;
    let tempNote = new Note(letterToMidi(letterValue.value, state.defaultOctave), state.defaultLength, state.defaultDotted);
    return parseNotePitch(tokens.slice(1), tempNote, state);
  } else if(tokens[0] instanceof Tokens.MidiNoteToken) {
    if(!(tokens[1] instanceof Tokens.NumberToken)) {
      throw new Error(`Expected Number Token: ${ Tokens.printToken(tokens[1]) }`);
    } else {
      let midiValue = tokens[1] as Tokens.NumberToken;
      let tempNote = new Note(midiValue.value, state.defaultLength, state.defaultDotted);
      return [tempNote, ...parseTokens(tokens.slice(2), state)];
      //return [...parseNoteLength(tokens, tempNote, state)];
    }
  } else {
    throw new Error(`Unexpected Note Tokens: ${ Tokens.printToken(tokens[0]) }`);
  }
}

function parseRest(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(!(tokens[0] instanceof Tokens.RestToken)) {
    throw new Error(`Unexpected Rest Token: ${ Tokens.printToken(tokens[0]) }`);
  } else {
    let tempNote = new Note(-1, state.defaultLength, state.defaultDotted);
    return parseNoteLength(tokens.slice(1), tempNote, state);
  }
}

//Expected: T116 or [(Tempo), (Number 116) ...]
function parseTempo(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(!(tokens[0] instanceof Tokens.TempoToken) || !(tokens[1] instanceof Tokens.NumberToken)) {
    throw new Error(`Unexpected Tempo Tokens: ${ Tokens.printToken(tokens[0]) } ${ Tokens.printToken(tokens[1]) }`);
  } else {
    let tempoNumber = tokens[1] as Tokens.NumberToken;
    return [new Tempo(tempoNumber.value) , ...parseTokens(tokens.slice(2), state)];
  }
}

function parseVolume(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(!(tokens[0] instanceof Tokens.VolumeToken) || !(tokens[1] instanceof Tokens.NumberToken)) {
    throw new Error(`Unexpected Volume Tokens: ${ Tokens.printToken(tokens[0]) } ${ Tokens.printToken(tokens[1]) }`);
  } else {
    let volumeNumber = tokens[1] as Tokens.NumberToken;
    return [new Volume(volumeNumber.value) , ...parseTokens(tokens.slice(2), state)];
  }
}

function parseLengthDot(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(tokens[0] instanceof Tokens.DotToken) {
    state.defaultDotted = true;
    //Add tie parsing here later too
    return parseTokens(tokens.slice(1), state);
  } else {
    state.defaultDotted = false;
    return parseTokens(tokens, state);
  }
}

function parseLength(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(!(tokens[0] instanceof Tokens.LengthToken) || !(tokens[1] instanceof Tokens.NumberToken)) {
    throw new Error(`Unexpected Length Tokens: ${ Tokens.printToken(tokens[0]) } ${ Tokens.printToken(tokens[1]) }`);
  } else {
    let lengthNumber = tokens[1] as Tokens.NumberToken;
    state.defaultLength = lengthNumber.value;
    return parseLengthDot(tokens.slice(2), state);
  }
}

function parseOctave(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(!(tokens[0] instanceof Tokens.OctaveToken) || !(tokens[1] instanceof Tokens.NumberToken)) {
    throw new Error(`Unexpected Octave Tokens: ${ Tokens.printToken(tokens[0]) } ${ Tokens.printToken(tokens[1]) }`);
  } else {
    let lengthNumber = tokens[1] as Tokens.NumberToken;
    state.defaultOctave = lengthNumber.value;
    return parseTokens(tokens.slice(2), state);
  }
}

function parseOctaveUp(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(!(tokens[0] instanceof Tokens.OctaveUpToken)) {
    throw new Error(`Unexpected Octave Up Token: ${ Tokens.printToken(tokens[0]) }`);
  } else {
    state.defaultOctave += 1;
    return parseTokens(tokens.slice(1), state);
  }
}

function parseOctaveDown(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(!(tokens[0] instanceof Tokens.OctaveDownToken)) {
    throw new Error(`Unexpected Octave Down Token: ${ Tokens.printToken(tokens[0]) }`);
  } else {
    state.defaultOctave -= 1;
    return parseTokens(tokens.slice(1), state);
  }
}

export function parseTokens(tokens: Array<Tokens.MMLToken>, state: MMLState): Array<MMLNode> {
  if(tokens.length !== 0 && state !== null) {
    //alert(mml.charAt(0));
    if(tokens[0] instanceof Tokens.LetterNoteToken || tokens[0] instanceof Tokens.MidiNoteToken) {
      return parseNote(tokens, state);
    } else if(tokens[0] instanceof Tokens.TempoToken) {
      return parseTempo(tokens, state);
    } else if(tokens[0] instanceof Tokens.LengthToken) {
      return parseLength(tokens, state);
    } else if(tokens[0] instanceof Tokens.OctaveToken) {
      return parseOctave(tokens, state);
    } else if(tokens[0] instanceof Tokens.VolumeToken) {
      return parseVolume(tokens, state);
    } else if(tokens[0] instanceof Tokens.RestToken) {
      return parseRest(tokens, state);
    } else if(tokens[0] instanceof Tokens.OctaveUpToken) {
      return parseOctaveUp(tokens, state);
    } else if(tokens[0] instanceof Tokens.OctaveDownToken) {
      return parseOctaveDown(tokens, state);
    } else if(tokens[0] instanceof Tokens.TieToken) {
      return parseTokens(tokens.slice(1), state);
    } else {
      console.log(`reached new token ${ Tokens.printTokens(tokens) }`);
      return [];
      //throw `Unexpected Token: ${ Tokens.printToken(tokens[0]) }`;
    }
  } else {
    return [];
  }
}

function displayContents(contents: any) {
  var HTML = document.getElementById('file-content');
  if(HTML) {
      HTML.textContent = contents;
  }
}

function displayParsed(result: Note | Tempo) {
  if(result instanceof Note) {
    displayContents(result.noteValue);
  } else {
    displayContents(result.tempoValue);
  }
}

function Parser() {
  let result = "test";
  let testType = new Tokens.LetterNoteToken(Tokens.NoteType.A);
  //let testResult = Lexer.lexify("t131ABCDEFG11");

  let testResult = Lexer.lexify(TRACK3);
  let testParsed = parseTokens(testResult, new MMLState(4, 4));
  //alert(testResult);
  //alert(Tokens.printTokens(testResult));
  //alert(Tokens.printToken(testType));
  return (
    <div>
    This is a test
    <input onChange={openFile} id="file-input" />
    <div id="file-content"> </div>
    <div id="debug"> {Tokens.printTokens(testResult)}</div>
    <div id="parsed-content"> {printNodes(testParsed)}</div>
    {/* <button type="button" id="parse-test" onClick={ () => { displayParsed(parseString(MINIMML, new MMLState(4, 4))) } }> TEST </button> */}
    </div>

  );
}

export default Parser;
