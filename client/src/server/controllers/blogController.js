import BlogPost from '../models/BlogPost.js';

export const getBlogPosts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { status: 'published' };

    if (category) {
      filter.category = category;
    }

    const posts = await BlogPost.find(filter)
      .populate('author', 'name email')
      .sort({ publishedAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOne({ slug, status: 'published' })
      .populate('author', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// Admin CRUD controllers
export const createBlogPost = async (req, res, next) => {
  try {
    const postData = {
      ...req.body,
      author: req.user._id,
      publishedAt: req.body.status === 'published' ? new Date() : null
    };

    const post = new BlogPost(postData);
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully.',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Update publishedAt timestamp if status changed to published
    if (updateData.status === 'published') {
      updateData.publishedAt = updateData.publishedAt || new Date();
    } else {
      updateData.publishedAt = null;
    }

    const post = await BlogPost.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully.',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Blog post not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
