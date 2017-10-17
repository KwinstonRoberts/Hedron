
exports.up = function(knex, Promise) {
  knex.schema.createTable('messages',function(t){
    t.increments();
    t.string('user')
    t.string('body')
    t.timestamp();
  })
};

exports.down = function(knex, Promise) {
};
