import Joi from 'joi';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(', '),
    });
  }
  next();
};

export const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  product: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    discountPrice: Joi.number().min(0).optional(),
    category: Joi.string().required(),
    brand: Joi.string().optional(),
    stock: Joi.number().min(0).required(),
    featured: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};
