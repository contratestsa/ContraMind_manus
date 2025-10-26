// server/_core/validate.ts
import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // validate body+query+params (adjust per route)
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      return next();
    } catch (err: any) {
      return res.status(400).json({ error: "validation_error", issues: err?.issues || [] });
    }
  };

