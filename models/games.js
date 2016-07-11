var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	id:  String,
	name: String
});

module.exports = mongoose.model('Game', schema);