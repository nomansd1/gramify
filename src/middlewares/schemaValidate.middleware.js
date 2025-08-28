import { ZodError } from "zod";
import { asyncHandler, ApiError } from "../utils/index.js";

const schemaValidate = ({ querySchema, bodySchema, paramsSchema, headersSchema }) =>
  asyncHandler(async (req, res, next) => {
    try {
      
      querySchema?.parse(req.query);
      bodySchema?.parse(req.body);
      paramsSchema?.parse(req.params);
      headersSchema?.parse(req.headers);

      return next();
    }
    catch (err) {
      if (err instanceof ZodError) {
        const formattedErrors = err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        throw new ApiError(400, "Validation error", formattedErrors);
      }

      throw err;
    }
  });

export default schemaValidate;