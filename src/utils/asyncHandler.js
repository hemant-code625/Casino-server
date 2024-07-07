export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    return Promise.resolve(
      requestHandler(req, res, next).catch((error) =>
        next(console.error(error))
      )
    );
  };
};
