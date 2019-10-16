const mongoose = require("mongoose");

var Todo = mongoose.model("Todo", {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  _creater: {
    type: mongoose.Schema.Types.ObjectId,
    reuiqred: true
  }
});

module.exports = {Todo};
