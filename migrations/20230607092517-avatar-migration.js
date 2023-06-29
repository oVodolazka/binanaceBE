module.exports = {
  async up(db) {
    await db.collection('users').updateMany({}, {$set: {avatar: ''}});

  },

  async down(db) {
    await db.collection('users').updateMany({}, {$unset: {avatar:""}});
  }
};