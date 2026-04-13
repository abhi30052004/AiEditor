import mongoose from 'mongoose'

const GenerationSchema = new mongoose.Schema(
  {
    platform: String,
    tone: String,
    length: String,
    audience: String,
    prompt: String,
    content: String,
  },
  { timestamps: true }
)

export default mongoose.models.Generation || mongoose.model('Generation', GenerationSchema)