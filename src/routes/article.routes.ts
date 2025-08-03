import { Router } from 'express';
import { authenticateUser } from '../utils/middleware/authMiddleware';
import { ArticleController } from '../controllers/article.controller';

const router = Router();
const articleController = new ArticleController();

router.post('/', authenticateUser, articleController.create.bind(articleController));
router.put('/:id', authenticateUser, articleController.edit.bind(articleController));
router.delete('/:id', authenticateUser, articleController.softDelete.bind(articleController));
router.patch('/like/:id', authenticateUser, articleController.like.bind(articleController));
router.patch('/dislike/:id', authenticateUser, articleController.dislike.bind(articleController));
router.patch('/block/:id', authenticateUser, articleController.block.bind(articleController));
router.get('/my-articles', authenticateUser, articleController.getMyArticles.bind(articleController));
router.get('/preferred', authenticateUser, articleController.getPreferredArticles.bind(articleController));
export default router;