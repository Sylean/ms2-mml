export interface MMLToken {

}

export class NumberToken implements MMLToken {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
}

export enum NoteType {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
}

export interface NoteToken extends MMLToken {

}

export class LetterNoteToken implements NoteToken {
  value: NoteType;
  constructor(value: NoteType) {
    this.value = value;
  }
}

export class MidiNoteToken implements NoteToken {

}

export class LengthToken implements MMLToken {

}

export class RestToken implements MMLToken {

}

export class TempoToken implements MMLToken {

}

export class VolumeToken implements MMLToken {

}

export class OctaveToken implements MMLToken {

}

export interface OctaveModifierToken extends MMLToken {

}

export class OctaveDownToken implements OctaveModifierToken {

}

export class OctaveUpToken implements OctaveModifierToken {

}

export interface PitchModifierToken extends MMLToken {

}

export class SharpToken implements PitchModifierToken {

}

export class FlatToken implements PitchModifierToken {

}

export class DotToken implements MMLToken {

}

export class TieToken implements MMLToken {

}

export function printToken(token: MMLToken): string {
  if(token instanceof LetterNoteToken) {
    return `(Note ${token.value})`;
  } else if(token instanceof MidiNoteToken) {
    return "(Note)";
  } else if (token instanceof NumberToken) {
    return `(Number ${token.value})`;
  } else if (token instanceof TempoToken) {
    return "(Tempo)"
  } else if (token instanceof LengthToken) {
    return "(Length)"
  } else if (token instanceof DotToken) {
    return "(Dot)"
  } else if (token instanceof VolumeToken) {
    return "(Volume)"
  } else if (token instanceof OctaveToken) {
    return "(Octave)"
  } else if (token instanceof OctaveDownToken) {
    return "(OctaveDown)"
  } else if (token instanceof OctaveUpToken) {
    return "(OctaveUp)"
  } else if (token instanceof SharpToken) {
    return "(Sharp)"
  } else if (token instanceof FlatToken) {
    return "(Flat)"
  } else if (token instanceof TieToken) {
    return "(Tie)"
  } else if (token instanceof RestToken) {
    return "(Rest)"
  } else {
    return "FILLER";
  }
}

export function printTokens(tokens: Array<MMLToken>): string {
  return tokens.map(token => printToken(token)).join();
}
