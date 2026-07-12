import Indicator from '../models/Indicator.js';

export const getIndicators = async (req, res, next) => {
  try {
    const { category, style } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }
    if (style) {
      filter.tradingStyle = style;
    }

    const indicators = await Indicator.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: indicators
    });
  } catch (error) {
    next(error);
  }
};

export const getIndicatorBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const indicator = await Indicator.findOne({ slug, isActive: true });
    
    if (!indicator) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Indicator not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: indicator
    });
  } catch (error) {
    next(error);
  }
};

// Admin CRUD controllers
export const createIndicator = async (req, res, next) => {
  try {
    const indicator = new Indicator(req.body);
    await indicator.save();

    res.status(201).json({
      success: true,
      message: 'Indicator created successfully.',
      data: indicator
    });
  } catch (error) {
    next(error);
  }
};

export const updateIndicator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const indicator = await Indicator.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!indicator) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Indicator not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Indicator updated successfully.',
      data: indicator
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIndicator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const indicator = await Indicator.findByIdAndDelete(id);

    if (!indicator) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Indicator not found.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Indicator deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
