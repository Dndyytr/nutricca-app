const validate =
  (schema, property = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: property === 'body',
      stripUnknown: true,
    });

    if (error) return next(error);
    req.validated = { ...req.validated, ...value };

    next();
  };

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) return next(error);

  req.validated = value;
  next();
};

export { validate, validateQuery };
