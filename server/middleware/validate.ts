import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errArray = errors.array();
    const firstMsg = errArray[0]?.msg || 'Validation failed';
    res.status(400).json({
      success: false,
      message: firstMsg,
      errors: errArray.map((err: any) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  };
};
