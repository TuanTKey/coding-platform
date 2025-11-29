const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

classSchema.pre('save', function(next) {
  if (this.name) this.name = this.name.toUpperCase();
  if (!this.slug && this.name) this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  next();
});

module.exports = mongoose.model('Class', classSchema);
