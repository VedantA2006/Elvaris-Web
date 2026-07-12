import FAQ from '../models/FAQ.js';

export const getFAQs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

// Admin CRUD controllers
export const createFAQ = async (req, res, next) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully.',
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

export const updateFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'FAQ not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully.',
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'FAQ not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
