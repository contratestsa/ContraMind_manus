// server/_core/validate.ts
import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

/**
 * Express middleware factory that validates body/query/params with Zod.
 * Returns HTTP 400 with structured issues on failure.
 */
export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: "validation_error", issues: err?.issues || [] });
    }
  };

