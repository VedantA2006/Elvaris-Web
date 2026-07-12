import DocArticle from '../models/DocArticle.js';

export const getDocArticles = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    const articles = await DocArticle.find(filter).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

export const getDocArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await DocArticle.findOne({ slug, isActive: true });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Documentation article not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// Admin CRUD controllers
export const createDocArticle = async (req, res, next) => {
  try {
    const article = new DocArticle(req.body);
    await article.save();

    res.status(201).json({
      success: true,
      message: 'Documentation article created successfully.',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await DocArticle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Documentation article not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Documentation article updated successfully.',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await DocArticle.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Documentation article not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Documentation article deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
