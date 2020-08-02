import { TESTMML } from './testmml';
import { MINIMML } from './testmml';
import * as Tokens from './Tokens';

function extractNumber(mml: string) {
  var numberMatch = /\d+/;
  var tempo = numberMatch.exec(mml);
  if(tempo === null) {
    throw "Expected number to follow tempo";
  }
  return tempo[0];
}

export function lexify(mml: string): Array<Tokens.MMLToken> {
  if(mml.length === 0) {
    return [];
  }
  switch(mml.charAt(0).toUpperCase()) {
    case 'A':
      return [new Tokens.LetterNoteToken(Tokens.NoteType.A), ...lexify(mml.substring(1))];
      break;
    case 'B':
      return [new Tokens.LetterNoteToken(Tokens.NoteType.B), ...lexify(mml.substring(1))];
      break;
    case 'C':
      return [new Tokens.LetterNoteToken(Tokens.NoteType.C), ...lexify(mml.substring(1))];
      break;
    case 'D':
      return [new Tokens.LetterNoteToken(Tokens.NoteType.D), ...lexify(mml.substring(1))];
      break;
    case 'E':
      return [new Tokens.LetterNoteToken(Tokens.NoteType.E), ...lexify(mml.substring(1))];
      break;
    case 'F':
      return [new Tokens.LetterNoteToken(Tokens.NoteType.F), ...lexify(mml.substring(1))];
      break;
    case 'G':
      return [new Tokens.LetterNoteToken(Tokens.NoteType.G), ...lexify(mml.substring(1))];
      break;
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      var result = extractNumber(mml);
      console.log(typeof(result));
      return [new Tokens.NumberToken(parseInt(result)), ...lexify(mml.substring(result.length))];
      break;
    case 'T':
      return [new Tokens.TempoToken(), ...lexify(mml.substring(1))];
      break;
    case 'L':
      return [new Tokens.LengthToken(), ...lexify(mml.substring(1))];
      break;
    case '.':
      return [new Tokens.DotToken(), ...lexify(mml.substring(1))];
      break;
    case 'V':
      return [new Tokens.VolumeToken(), ...lexify(mml.substring(1))];
      break;
    case 'O':
      return [new Tokens.OctaveToken(), ...lexify(mml.substring(1))];
      break;
    case '<':
      return [new Tokens.OctaveDownToken(), ...lexify(mml.substring(1))];
      break;
    case '>':
      return [new Tokens.OctaveUpToken(), ...lexify(mml.substring(1))];
      break;
    case '+':
    case '#':
      return [new Tokens.SharpToken(), ...lexify(mml.substring(1))];
      break;
    case '-':
      return [new Tokens.FlatToken(), ...lexify(mml.substring(1))];
      break;
    case '&':
      return [new Tokens.TieToken(), ...lexify(mml.substring(1))];
      break;
    case 'R':
      return [new Tokens.RestToken(), ...lexify(mml.substring(1))];
      break;
    case 'N':
      return [new Tokens.MidiNoteToken(), ...lexify(mml.substring(1))];
      break;
  }
  return [];
}

export function MMLPrint(mml :Array<Tokens.MMLToken>) {

}
