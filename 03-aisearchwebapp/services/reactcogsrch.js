const { ChatOpenAI } = require('langchain/chat_models/openai');
const { BufferMemory } = require('langchain/memory');
const { ChatMessageHistory } = require('langchain/stores/message/in_memory');
const { initializeAgentExecutorWithOptions } = require('langchain/agents');
const { CognitiveSearchTool } = require('./cognitivesearchtool');
const { DEFAULT_PREFIX, DEFAULT_SUFFIX } = require('./prompts');

class ReActCogSrch {
  static _storages = {};

  constructor(topicId) {
    this.topicId = topicId;
    ReActCogSrch._storages[topicId] = ReActCogSrch._storages[topicId] || new ChatMessageHistory();
    this.storage = ReActCogSrch._storages[topicId];
  }

  async call({ input }) {
    try {
      const llm = new ChatOpenAI({
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_GPT_DEPLOYMENT_NAME,
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_GPT_API_VERSION,
        modelName: 'gpt-3.5-turb',
        temperature: 0.2,
        topP: 1,
      });

      const tools = [
        new CognitiveSearchTool()
      ];

      const executor = await initializeAgentExecutorWithOptions(
        tools,
        llm,
        {
          agentType: 'chat-conversational-react-description',
          memory: new BufferMemory({
            chatHistory: this.storage,
            returnMessages: true,
            memoryKey: 'chat_history'
          }),
          agentArgs: {
            systemMessage: DEFAULT_PREFIX,
            humanMessage: DEFAULT_SUFFIX
          },
          verbose: true
        }
      );

      const result = await executor.call({ input });

      return {
        output: result.output,
      };
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = {
  ReActCogSrch
};