export const validatePublishRequest = (req, res, next) => {
  const errors = [];

  // 1. Validate image existence
  if (!req.file) {
    errors.push('An image file is required.');
  }

  // 2. Validate platform selection
  let platforms = req.body.platforms;
  
  if (typeof platforms === 'string') {
    try {
      platforms = JSON.parse(platforms);
    } catch {
      // Clean brackets and quotes if present
      const cleaned = platforms.replace(/[\[\]"']/g, '');
      platforms = cleaned.split(',').map(p => p.trim()).filter(Boolean);
    }
  }

  if (Array.isArray(platforms)) {
    platforms = platforms.map(p => typeof p === 'string' ? p.replace(/[\[\]"']/g, '').trim() : p).filter(Boolean);
  }

  if (!Array.isArray(platforms) || platforms.length === 0) {
    errors.push('At least one platform (facebook or instagram) must be selected.');
  } else {
    const validPlatforms = ['facebook', 'instagram'];
    const invalidSelected = platforms.filter(p => !validPlatforms.includes(p.toLowerCase()));
    
    if (invalidSelected.length > 0) {
      errors.push(`Invalid platform(s) selected: ${invalidSelected.join(', ')}. Supported platforms are 'facebook' and 'instagram'.`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  // Attach normalized platforms back to req.body
  req.body.normalizedPlatforms = Array.from(new Set(platforms.map(p => p.toLowerCase())));
  next();
};
