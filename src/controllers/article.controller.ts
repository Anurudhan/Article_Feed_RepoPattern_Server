import { Request, Response, NextFunction } from 'express';
import { ArticleService } from '../services/article.service';
import { CustomRequest } from '../utils/customRequest';
import { StatusCodes } from '../config/statusCode';
import { Messages } from '../config/Messages';
import { Types } from 'mongoose';

export class ArticleController {
  constructor(private articleService = new ArticleService()) {}

  async create(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const article = await this.articleService.create(req.body, req.user!.userId);
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: Messages.ARTICLE.CREATE_SUCCESS,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }

  async edit(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await this.articleService.update(req.params.id, req.body);
      if (!updated) {
        const err = new Error(Messages.ARTICLE.NOT_FOUND);
        (err as any).statusCode = StatusCodes.NOT_FOUND;
        throw err;
      }

      res.json({
        success: true,
        message: Messages.ARTICLE.UPDATE_SUCCESS,
        updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const deleted = await this.articleService.softDelete(req.params.id,req.user?.userId as string);
      console.log(deleted,"this is deleted data ===========>")
      if (!deleted) {
        const err = new Error(Messages.ARTICLE.NOT_FOUND);
        (err as any).statusCode = StatusCodes.NOT_FOUND;
        throw err;
      }

      res.json({
        success: true,
        message: Messages.ARTICLE.DELETE_SUCCESS,
        article: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  async like(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const updated = await this.articleService.toggleLike(req.params.id, req.user!.userId);
      res.json({
        success: true,
        message: Messages.ARTICLE.LIKE_SUCCESS,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async dislike(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const updated = await this.articleService.toggleDislike(req.params.id, req.user!.userId);
      res.json({
        success: true,
        message: Messages.ARTICLE.DISLIKE_SUCCESS,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async block(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const updated = await this.articleService.toggleBlock(req.params.id, req.user!.userId);
      res.json({
        success: true,
        message: Messages.ARTICLE.BLOCK_SUCCESS,
        article: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyArticles(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { page = 1, limit = 10, search, category, sortBy = 'newest' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

        const query:any = { authorId: new Types.ObjectId(userId),isDeleted: false };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } },
        ];
      }

      if (category) query.category = category;

      const sortOption: any = sortBy === 'popular' ? { views: -1 } : { publishedAt: -1 };

      const [articles, totalCount] = await this.articleService.getMyArticles(
        userId,
        query,
        sortOption,
        skip,
        limitNum
      );

      const totalPages = Math.ceil(totalCount / limitNum);

      const response = {
        articles,
        totalCount,
        totalPages,
        currentPage: pageNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      };

      res.json({
        success: true,
        message: Messages.ARTICLE.FETCH_SUCCESS,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
  async getPreferredArticles(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const result = await this.articleService.getPreferredArticles(userId, {
      page: parseInt(req.query.page as string),
      limit: parseInt(req.query.limit as string),
      search: req.query.search as string,
      category: req.query.category as string,
      sortBy: req.query.sortBy as string
    });

    res.status(200).json({
      success: true,
      message: 'Articles based on preferences fetched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

}
