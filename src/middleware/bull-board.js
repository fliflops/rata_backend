const { ExpressAdapter, createBullBoard, BullAdapter } = require('@bull-board/express');
const queues = require('../../src/jobs/queues/queues');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/bull');

createBullBoard({
    queues:Object.keys(queues).map(item => {
        const q = queues[item];
        return new BullAdapter(q)
    }),
    serverAdapter: serverAdapter
})



module.exports = serverAdapter