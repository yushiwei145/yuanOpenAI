const { EventEmitter } = require('events');

class Reader extends EventEmitter {
  constructor() {
    super();
  }

  async read(filepath) {
    const { PdfReader } = await import('pdfreader');
    const reader = new PdfReader();
  
    var pageNumber = 0;
    var lineHeight = 0;
    var text = '';
  
    reader.parseFileItems(filepath, async (err, item) => {
      if (err) {
        return console.error(err);
      }
  
      if (!item) {
        this.emit(`page`, { pageNumber, text });
        this.emit('done');
      } else if (item.page) {
        pageNumber && this.emit(`page`, { pageNumber, text });
        pageNumber = item.page;
        lineHeight = 0;
        text = '';
      } else if (item.text) {
        if (lineHeight === item.y || !lineHeight) {
          text += item.text;
        } else {
          text += '\n' + item.text;
        }
        lineHeight = item.y;
      }
    });
  }
}

module.exports = {
  PdfReader: Reader
};