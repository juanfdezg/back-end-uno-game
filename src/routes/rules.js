const Router = require('koa-router');

const router = new Router();

const rules = [
  {
    name: 'rule1',
    description: 'this is a game...',
  },
  {
    name: 'rule2',
    description: 'this is a game2 that ...',
  },
];

router.get('rules.show', '/show', async (ctx) => {
  ctx.body = rules;
});

module.exports = router;
