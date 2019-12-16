import { regQuote } from './util/regQuote';

export interface EscapeInterface {
  split(delimiter: string, input: string, limit?: number): string[];

  join(glue: string, input: string[]): string;

  encode(input: string, list: string[]): string;
}

interface ParseContext {
  res: string[];
  word: string;
  flag: boolean;
}

export enum EscapeServiceFlagEnum {
  LEAVE_EXCESS_ESCAPE,
  LEAVE_LAST_ESCAPE,
}

export class EscapeService implements EscapeInterface {
  constructor(protected escape: string = '\\') {
  }

  public split(delimiter: string, input: string, limit?: number): string[] {
    const tokens                = this.tokenize(input, [delimiter]);
    const context: ParseContext = {
      res:  [],
      word: '',
      flag: false,
    };
    for (const token of tokens) {
      if (typeof limit === 'number' && context.res.length === limit - 1) {
        context.word += token;
        continue;
      }
      this.processToken(token, delimiter, context);
    }
    if (context.flag && this.flags[EscapeServiceFlagEnum.LEAVE_LAST_ESCAPE]) {
      context.word += this.escape;
    }
    context.res.push(context.word);

    return context.res;
  }

  public join(glue: string, input: string[]): string {
    return input.map(word => this.encode(word, [glue])).join(glue);
  }

  encode(input: string, list: string[] = []): string {
    input = input.replace(new RegExp(regQuote(this.escape), 'g'), `${this.escape}${this.escape}`);
    for (const sep of list) {
      input = input.replace(new RegExp(regQuote(sep), 'g'), `${this.escape}${sep}`);
    }
    return input;
  }

  /**
   * Extract escape, escaped and other letters as separate tokens
   */
  protected tokenize(input: string, list: string[]): string[] {
    const parts = [regQuote(this.escape)];
    for (const sep of list) {
      parts.push(regQuote(sep));
    }
    const re = new RegExp(`(${parts.join('|')}|.+?)`, 'g');

    return input.match(re) as string[];
  }

  private processToken(token: string, delimiter: string, contextRef: ParseContext) {
    switch (token) {
      case this.escape:
        if (contextRef.flag) {
          contextRef.flag = false;
          contextRef.word += token;
        } else {
          contextRef.flag = true;
        }
        break;
      case delimiter:
        if (contextRef.flag) {
          contextRef.flag = false;
          contextRef.word += token;
        } else {
          contextRef.res.push(contextRef.word);
          contextRef.word = '';
        }
        break;
      default:
        if (contextRef.flag) {
          contextRef.flag = false;
          if (this.flags[EscapeServiceFlagEnum.LEAVE_EXCESS_ESCAPE]) {
            contextRef.word += this.escape;
          }
        }
        contextRef.word += token;
    }
  }

  private flags: { [k in EscapeServiceFlagEnum]: boolean } = {
    [EscapeServiceFlagEnum.LEAVE_EXCESS_ESCAPE]: false,
    [EscapeServiceFlagEnum.LEAVE_LAST_ESCAPE]:   true,
  };

  public setFlag(option: EscapeServiceFlagEnum, value: boolean) {
    this.flags[option] = value;
  }
}
