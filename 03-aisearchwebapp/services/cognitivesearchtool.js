const { Tool } = require('langchain/tools');
const { SearchDocumentsClient } = require('./cognitivesearchclient');

class CognitiveSearchTool extends Tool {
  name = 'hakusyo-db';

  description = '令和5年厚生労働白書。社会保障を支える人材の現状への理解を深め、今後の医療・福祉サービス提供体制と人材確保について考える資料です。インプットは検索クエリ、アウトプットは検索結果です。';

  constructor() {
    super();
  }

  async _call(input) {
    try {
      const client = new SearchDocumentsClient();
      const result = await client.searchVector(input, { top: 1 });

      const arr = result.data.value;

      if (arr.length > 0) {
        const docs = arr.map((item) => {
          return item.content;
        });
        return docs.join('\n');
      } else {
        return 'No results found';
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = {
  CognitiveSearchTool
};