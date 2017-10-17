
exports.up = function(knex, Promise) {
  knex.schema.table('messages',function(t){
    t.string('color');
  })
};

exports.down = function(knex, Promise) {

};
