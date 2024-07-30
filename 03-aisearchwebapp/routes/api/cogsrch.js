const { v4: uuid } = require('uuid');
const router = require('express').Router();
const { ReActCogSrch } = require('../../services/reactcogsrch');

router.post('/', async (req, res, next) => {
  const { topicId, message } = req.body;
  const sessionId = topicId ? topicId : uuid();

  const search = new ReActCogSrch(sessionId);
  const result = await search.call({ input: message });

  res.json({
    topicId: sessionId,
    message: result?.output
  });
});

module.exports = router;