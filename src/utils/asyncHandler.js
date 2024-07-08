const asyncHandler = (reqHandler) => {
  return (req, res, next) => {
    Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
  };
};

// const asyncHandler = (reqHandler) => async (req, res, next) => {
//     try {
//         await reqHandler(req, res, next);
//     } catch (error) {
//         return res.status(error.code || 500).json({
//             success: false,
//             message: error.message || "An error occurred"
//         })
//     }
// }

export { asyncHandler };
