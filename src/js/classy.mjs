const styleRe = new RegExp(`^\{(.+)\}$`);

export function classy(options) {
  let debug = false;
  let last = null;

  if (options) {
    debug = options.debug;
  }

  function walkTokens(token) {
    debug && console.debug('[Classy] token :', token);
    debug && console.debug('[Classy] last  :', last);
    if (token.type === 'text' && last.type === 'image') {
      if(styleRe.test(token.text)) {
        let content = token.text.substring(1, token.text.length-1);
        let options = content.split(/\s/);
        let classList = [];
        let width = null;
        let height = null;
        debug && console.debug('[Classy] options', options);
        for (let opt of options) {
          if(opt.length == 0) { continue; } // skips empty values
          if(opt.startsWith('.')) {
            classList.push(opt.substring(1));
            debug && console.debug('[Classy] class found', opt, classList);
          } else if (opt.startsWith('width=')) {
            width = opt.substring(6);
            debug && console.debug('[Classy] width found', opt, width);
          } else if (opt.startsWith('height=')) {
            debug && console.debug('[Classy] height found', opt, height);
            height = opt.substring(7);
          }
        }

        // FIXME kludge using the "title" attribute to trick renderer => how to
        // override image renderer ?
        last.title = last.title || '';
        if (classList.length > 0) {
          last.title += '" class="' + classList.join(' ');
        }
        if (width || height) {
          last.title += `" style="width: ${width}`;
        }
        token.text = ''; // remove text content
      }
    } else if (token.type === 'text' && last.type === 'inlineKatex') {
      // let content = token.text.substring(1, token.text.length-1);
      // let options = content.split(/\s/);
      // console.info(token, last)
      // for (let opt of options) {
      //   console.info(opt);
      // }
    }
    last = token;
  }

  return { walkTokens };
}