import { ZodError } from "zod";
import { asyncHandler, ApiError } from "../utils/index.js";

const schemaValidate = ({ querySchema, bodySchema, paramsSchema, headersSchema }) =>
  asyncHandler(async (req, res, next) => {
    try {

      console.log("req body", req.body);
      
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

// import { ZodError } from "zod";
// import { asyncHandler, ApiError } from "../utils/index.js";

// const schemaValidate = ({
//   querySchema,
//   bodySchema,
//   paramsSchema,
//   headersSchema,
// }) =>
//   asyncHandler(async (req, res, next) => {
//     try {
//       // Conditionally parse based on existence of the data
//       if (querySchema && req.query) {
//         querySchema.parse(req.query);
//       }
//       if (bodySchema && req.body) {
//         bodySchema.parse(req.body);
//       }
//       if (paramsSchema && req.params) {
//         paramsSchema.parse(req.params);
//       }
//       if (headersSchema && req.headers) {
//         headersSchema.parse(req.headers);
//       }
//       return next();
//     } catch (err) {
//       if (err instanceof ZodError) {
//         const formattedErrors = err.issues.map((issue) => ({
//           field: issue.path.join("."),
//           message: issue.message,
//         }));

//         throw new ApiError(400, "Validation error", formattedErrors);
//       }

//       throw err;
//     }
//   });

// export default schemaValidate;
