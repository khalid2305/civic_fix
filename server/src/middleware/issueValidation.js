export const validateIssue = (req, res, next) => {
  const { title, description, category, latitude, longitude, image } = req.body;
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!description || description.trim() === '') {
    errors.push('Description is required');
  }

  if (!category || category.trim() === '') {
    errors.push('Category is required');
  }

  // Geolocation validation
  if (latitude === undefined || longitude === undefined) {
    errors.push('Geolocation (latitude and longitude) is required');
  } else {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Invalid latitude. Must be between -90 and 90');
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Invalid longitude. Must be between -180 and 180');
    }
  }

  // Image validation
  if (!image || image.trim() === '') {
    errors.push('Image upload is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};
