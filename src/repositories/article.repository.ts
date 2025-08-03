import { ArticleModel } from '../models/articleModal';
import { Types } from 'mongoose';
import { AppError } from '../utils/API_Error';


export class ArticleRepository {
  async createArticle(data: any) {
    try {
      return await new ArticleModel(data).save();
    } catch (error) {
      throw new AppError('Database error: Failed to create article', 500);
    }
  }

  async updateArticle(id: string, data: any) {
    try {
      return await ArticleModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new AppError('Database error: Failed to update article', 500);
    }
  }
  async checkDuplicateArticle(title: string, content: string, category: string, excludeId?: string): Promise<boolean> {
    try {
      const query: any = {
        $or: [{ title }, { content }],
        category,
        isDeleted: { $ne: true }, // Exclude soft-deleted articles
      };

      if (excludeId) {
        query._id = { $ne: new Types.ObjectId(excludeId) }; // Exclude the current article during updates
      }

      const existingArticle = await ArticleModel.findOne(query);
      return !!existingArticle; // Returns true if a duplicate is found
    } catch (error) {
      throw new AppError('Database error: Failed to check for duplicate article', 500);
    }
  }

  async softDeleteArticle(id: string, userId: string) {
    try {
        const objectId = new Types.ObjectId(id);
        const article = await ArticleModel.findById(objectId);

        if (!article) {
            throw new AppError('Article not found', 404);
        }
        if (article.authorId.toString() !== userId) {
            throw new AppError('Unauthorized: Only the article author can delete this article', 403);
        }

        if (article.isDeleted) {
            throw new AppError('Article is already deleted', 400);
        }

        const deletedArticle = await ArticleModel.findByIdAndUpdate(
            objectId,
            { $set: { isDeleted: true } },
            { new: true }
        );
        return deletedArticle;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Database error: Failed to soft delete article', 500);
    }
}

    async findById(id: string) {
    try {
      const article = await ArticleModel.findById(id);
      if (!article) {
        throw new AppError('Article not found', 404);
      }
      return article;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Database error: Failed to find article', 500);
    }
  }

  async likeDislikeBlockArticle(id: string, field: string, userId: Types.ObjectId, isRemove: boolean) {
    try {
      const operation = isRemove
        ? { $pull: { [field]: userId } }
        : { $addToSet: { [field]: userId } };
      return await ArticleModel.findByIdAndUpdate(id, operation, { new: true });
    } catch (error) {
      throw new AppError(`Database error: Failed to toggle ${field}`, 500);
    }
  }

  async getUserArticles(userId: Types.ObjectId, query: any, sort: any, skip: number, limit: number) {
    try {
        
        const data = 
        await Promise.all([
        ArticleModel.aggregate([
          { $match: query },
          { $sort: sort },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'users',
              localField: 'authorId',
              foreignField: '_id',
              as: 'author',
            },
          },
          { $unwind: '$author' },
          {
            $project: {
              title: 1,
              content: 1,
              category: 1,
              authorId: 1,
              image: 1,
              tags: 1,
              publishedAt: 1,
              views: 1,
              readTime: 1,
              likes: 1,
              dislikes: 1,
              isDeleted: 1,
              blockedBy: 1,
              isPublished:1,
              author: {
                name: '$author.firstName',
              },
            },
          },
        ]).exec(),
        ArticleModel.countDocuments(query),
      ]);
      return data
    } catch (error) {
      throw new AppError('Database error: Failed to fetch user articles', 500);
    }
  }
  async fetchArticles(query: any, sort: any, skip: number, limit: number) {
  try {
    const [articles, totalCount] = await Promise.all([
      ArticleModel.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $project: {
            title: 1,
            content: 1,
            category: 1,
            tags: 1,
            authorId: 1,
            image: 1,
            views: 1,
            likes: 1,
            dislikes: 1,
            publishedAt: 1,
            readTime: 1,
            isDeleted: 1,
            blockedBy: 1,
            author: {
              name: '$author.firstName'
            }
          }
        }
      ]),
      ArticleModel.countDocuments(query)
    ]);
    return { articles, totalCount };
  } catch (error) {
    throw new AppError('Database error: Failed to fetch articles', 500);
  }
}

}
