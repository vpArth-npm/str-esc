import { regQuote } from './util/regQuote';

export interface EscapeInterface {
  split(delimiter: string, input: string, limit?: number): string[];
  join(glue: string, input: string[]): string;
  encode(input: string, list: string[]): string;
}

export class EscapeService implements EscapeInterface {
  static LEAVE_EXCESS_ESCAPE = 'excess_escape';
  static LEAVE_LAST_ESCAPE = 'last_escape';
  private flags = {
    [EscapeService.LEAVE_EXCESS_ESCAPE]: false,
    [EscapeService.LEAVE_LAST_ESCAPE]: true,
  };
  constructor(protected escape: string = '\\') {
  }

  public split(delimiter: string, input: string, limit: number = null): string[] {
    const tokens  = this.tokenize(input, [delimiter]);
    const context = {
      res:  [],
      word: '',
      flag: false,
    };
    for (const token of tokens) {
      if (null !== limit && context.res.length === limit - 1) {
        context.word += token;
        continue;
      }
      this.processToken(token, delimiter, context);
    }
    if (context.flag && this.flags[EscapeService.LEAVE_LAST_ESCAPE]) {
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
    const re = new RegExp(`(${parts.join('|')}|.+?)`, 'ug');

    return input.match(re);
  }

  private processToken(token: string, delimiter: string, contextRef: { flag: boolean, word: string, res: string[] }) {
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
          if (this.flags[EscapeService.LEAVE_EXCESS_ESCAPE]) {
            contextRef.word += this.escape;
          }
        }
        contextRef.word += token;
    }
  }

  public setFlag(option, value: boolean) {
    this.flags[option] = value;
  }
}
