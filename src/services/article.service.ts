// src/services/article.service.ts
import { ArticleRepository } from '../repositories/article.repository';
import mongoose, { Types } from 'mongoose';
import { AppError } from '../utils/API_Error';
import { Messages } from '../config/Messages';
import { StatusCodes } from '../config/statusCode';
import { AuthRepository } from '../repositories/auth.repository';


export class ArticleService {
  constructor(private articleRepo = new ArticleRepository(),
    private authRepo = new AuthRepository() ) {}

  async create(data: any, userId: string) {
    try {
        const isDuplicate = await this.articleRepo.checkDuplicateArticle(data.title, data.content, data.category);
      if (isDuplicate) {
        throw new AppError('An article with the same title or content already exists in this category', 400);
      }
      return await this.articleRepo.createArticle({ ...data, authorId: userId });
    } catch (error) {
      throw new AppError(Messages.ARTICLE.CREATE_FAILED, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, data: any) {
    try {
        const isDuplicate = await this.articleRepo.checkDuplicateArticle(data.title, data.content, data.category, id);
      if (isDuplicate) {
        throw new AppError('An article with the same title or content already exists in this category', 400);
      }

      const updated = await this.articleRepo.updateArticle(id, data);
      if (!updated) throw new AppError(Messages.ARTICLE.NOT_FOUND, StatusCodes.NOT_FOUND);
      return updated;
    } catch (error) {
      throw new AppError(Messages.ARTICLE.UPDATE_FAILED, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async softDelete(id: string,userId:string) {
    try {
      const deleted = await this.articleRepo.softDeleteArticle(id,userId);
      console.log(deleted,"this is deleted data from the service")
      if (!deleted) throw new AppError(Messages.ARTICLE.NOT_FOUND, StatusCodes.NOT_FOUND);
      return deleted;
    } catch (error) {
      throw new  AppError(Messages.ARTICLE.UPDATE_FAILED, StatusCodes.NOT_FOUND);
    }
  }

  async toggleLike(id: string, userId: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) throw new AppError(Messages.ARTICLE.NOT_FOUND, StatusCodes.NOT_FOUND);
    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = !!article.likes.includes(userId);
    return await this.articleRepo.likeDislikeBlockArticle(id, 'likes', userObjectId, hasLiked);
  }

  async toggleDislike(id: string, userId: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) throw new AppError(Messages.ARTICLE.NOT_FOUND, StatusCodes.NOT_FOUND);
    const userObjectId = new Types.ObjectId(userId);
    const hasDisliked = !!article.dislikes.includes(userId);
    return await this.articleRepo.likeDislikeBlockArticle(id, 'dislikes', userObjectId, hasDisliked);
  }

  async toggleBlock(id: string, userId: string) {
    const article = await this.articleRepo.findById(id);
    if (!article) throw new AppError(Messages.ARTICLE.NOT_FOUND, StatusCodes.NOT_FOUND);
    const userObjectId = new Types.ObjectId(userId);
    const hasBlocked = !!article.blockedBy.includes(userId);
    return await this.articleRepo.likeDislikeBlockArticle(id, 'blockedBy', userObjectId, hasBlocked);
  }

  async getMyArticles(userId: string, query: any, sort: any, skip: number, limit: number) {
    try {
      return await this.articleRepo.getUserArticles(new Types.ObjectId(userId), query, sort, skip, limit);
    } catch (error) {
      throw new AppError(Messages.ARTICLE.FETCH_FAILED, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
 async getPreferredArticles(
  userId: string,
  queryParams: {
    search?: string;
    category?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }
) {
  const user = await this.authRepo.findUserById(userId);
  console.log(userId)
  const {
    page = 1,
    limit = 10,
    search,
    category,
    sortBy = 'newest'
  } = queryParams;

  const pageNum = parseInt(page as any);
  const limitNum = parseInt(limit as any);
  const skip = (pageNum - 1) * limitNum;

const userObjectId = new mongoose.Types.ObjectId(userId);

  // Start with the base query
  let query: any = {
    isDeleted: false,
    blockedBy: { $nin: [userObjectId] }
  };

  // If category is explicitly provided, ignore user preferences
  if (category) {
    query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
  } else if (user && user.articlePreferences?.length > 0) {
    // Use user preferences only if no specific category is selected
    query.$or = [{ category: { $in: user.articlePreferences } }];

    if (search) {
      query.$or.push(
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      );
    }
  } else {
    // No category, no preferences — just apply search if exists
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
  }

  // Sorting
  let sortOption: any = {};
  switch (sortBy) {
    case 'popular':
      sortOption = { views: -1 };
      break;
    case 'newest':
    default:
      sortOption = { publishedAt: -1 };
  }

  // Fetch and return paginated articles
  const { articles, totalCount } = await this.articleRepo.fetchArticles(
    query,
    sortOption,
    skip,
    limitNum
  );

  const totalPages = Math.ceil(totalCount / limitNum);

  return {
    articles,
    totalCount,
    totalPages,
    currentPage: pageNum,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1
  };
}

}
