import React from 'react';
import * as Lexer from './Lexer';
import * as Tokens from './Tokens';
import { TESTMML, MINIMML } from './testmml';

function playMusic() {
  alert("test");
}

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

enum MMLType {
  NOTE = "NOTE",
  TEMPO = "TEMPO",
  VOLUME = "VOLUME"
}

interface MMLNode {
  getType(): MMLType;
}

class Note implements MMLNode {
  noteValue: string;
  octaveValue: number;
  noteLength: number;
  constructor(note: string, octave: number, length: number) {
    this.noteValue = note;
    this.octaveValue = octave;
    this.noteLength = length;
  }
  getType() {
    return MMLType.NOTE;
  }
}

const placeholderNote = new Note("A", 8, 1);

class Tempo implements MMLNode {
  tempoValue: number;
  constructor(tempo: number) {
    this.tempoValue = tempo;
  }
  getType() {
    return MMLType.TEMPO;
  }
}

class Volume implements MMLNode {
  volumeValue: number;
  constructor(volume: number) {
    this.volumeValue = volume;
  }
  getType() {
    return MMLType.VOLUME;
  }
}

class MMLState {
  defaultLength: number;
  defaultOctave: number;
  constructor(length: number, octave: number) {
    this.defaultLength = length;
    this.defaultOctave = octave;
  }
}

function sharpify(note: Note) {
  return note;
}

function flatify(note: Note) {
  return note;
}

function parseExtras(tokens: Array<Tokens.MMLToken>, note: Note) {
  switch(mml.charAt(0)) {
    case '.':
      note.noteLength = note.noteLength * 1.5;
      return note;
      break;
    case '+':
    case '#':
      return sharpify(note);
      break;
    case '-':
      return flatify(note);
      break;
    case '&':
      return note;
      break;
    default:
      return note;
      break;
  }
}

function parseNote(tokens: Array<Tokens.MMLToken>, state: MMLState): Note {
  switch(mml.charAt(0).toUpperCase()) {
    case 'A':
    case 'B':
    case 'C':
    case 'D':
    case 'E':
    case 'F':
    case 'G':
    case 'R':
    case 'N':
  }
  return placeholderNote;
}

function parseTempo(tokens: Array<Tokens.MMLToken>, state: MMLState): Tempo {
  if(mml.charAt(0).toUpperCase() !== 'T') {
    throw `Unexpected Token: ${ mml.charAt(0) }`;
  } else {
    var numberMatch = /\d+/;
    var tempo = numberMatch.exec(mml);
    if(tempo === null) {
      throw "Expected number to follow tempo";
    }
    return new Tempo(8);
    //return parseString(mml.substring(1 + tempo[0].length), state);
  }
}

function parseString(tokens: Array<Tokens.MMLToken>, state: MMLState): Tempo | Note {
  if(mml.length !== 0 && state !== null) {
    //alert(mml.charAt(0));
    switch(mml.charAt(0).toUpperCase()) {
      case 'A':
      case 'B':
      case 'C':
      case 'D':
      case 'E':
      case 'F':
      case 'G':
      case 'R':
      case 'N':
        //alert("found Note");
        return parseNote(mml, state);
        break;
      case 'T':
        //alert("Found T");
        return parseTempo(mml, state);
        break;
      case 'L':
      case 'O':
      case 'V':
        break;
      default:
        throw `Unexpected Token: ${ mml.charAt(0) }`;
        break;
    }
  }
  return new Note("A", 8, 1);
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

  let testResult = Lexer.lexify(TESTMML);
  //alert(testResult);
  //alert(Tokens.printTokens(testResult));
  //alert(Tokens.printToken(testType));
  return (
    <div>
    This is a test
    <input onChange={openFile} id="file-input" />
    <div id="file-content"> </div>
    <div id="parsed-content"> {Tokens.printTokens(testResult)}</div>
    {/* <button type="button" id="parse-test" onClick={ () => { displayParsed(parseString(MINIMML, new MMLState(4, 4))) } }> TEST </button> */}
    </div>

  );
}

export default Parser;
