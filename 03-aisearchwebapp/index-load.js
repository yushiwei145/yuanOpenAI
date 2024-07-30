const { TokenTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { v4: uuid } = require('uuid');
const axios = require('axios');
const { PdfReader } = require('./pdfreader.js');

async function extract() {
  const FILE_NAME = 'メットライフ生命';
  const FILE_PATH = './data/test.pdf';

  return new Promise((resolve, reject) => {
    const data = [];
    const reader = new PdfReader();
    reader.on('page', ({ pageNumber, text }) => {
      data.push({
        title: FILE_NAME,
        pageNumber,
        text
      })
    });
    reader.on('done', () => {
      resolve(data);
    });
    reader.read(FILE_PATH);
  });
}

async function transform(item) {
  const data = [];

  // Split text into chunks.
  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: 2000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitText(item.text);

  // Covert text chunk into vector.
  const embeddings = new OpenAIEmbeddings({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_EMBED_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_EMBED_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBED_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_EMBED_API_VERSION,
  });
  for (let chunk of chunks) {
    const vector = await embeddings.embedQuery(chunk);
    data.push({
      id: uuid(),
      title: `${item.title} - Page ${item.pageNumber}`,
      content: chunk,
      contentVector: vector,
    });
  }

  return data;
}

async function load(documents) {
  const SERVICE_NAME = process.env.AZURE_COGSRCH_SERVICE_NAME;
  const ADMIN_KEY = process.env.AZURE_COGSRCH_ADMIN_KEY;
  const INDEX_NAME = process.env.AZURE_COGSRCH_INDEX_NAME;

  const url = new URL(`https://${SERVICE_NAME}.search.windows.net`);
  url.pathname = `/indexes/${INDEX_NAME}/docs/index`;
  url.searchParams.append('api-version', '2023-07-01-Preview');

  const res = await axios({
    method: 'POST',
    url: url.toString(),
    headers: {
      'Content-Type': 'application/json',
      'api-key': ADMIN_KEY,
    },
    data: {
      value: documents
    }
  });
}

(async () => {
  // ----------------------------------------
  // Extract
  // ----------------------------------------
  console.log('Extracting...');
  const indata = await extract();

  // ----------------------------------------
  // Transform
  // ----------------------------------------
  console.log('Transforming...');
  const outdata = [];
  for (let source of indata) {
    const target = await transform(source);
    outdata.push(...target);
  }

  // ----------------------------------------
  // Load
  // ----------------------------------------
  console.log('Loading...');
  await load(outdata);

  console.log('Done!');
})();
