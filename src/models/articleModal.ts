import mongoose, { Schema, Document, Types } from 'mongoose';
import { Article } from '../types/articleEntity';


const ArticleSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User',default: []  }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: 'User',default: []  }],
  blockedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  readTime: { type: Number, required: true, default: 1 },
  views: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  tags: [{ type: String }],
  isDeleted: { type: Boolean, default: false },
  isPublished:{ type:Boolean, default:false }
}, { timestamps: true });

export const ArticleModel = mongoose.model<Article>('Article', ArticleSchema);
