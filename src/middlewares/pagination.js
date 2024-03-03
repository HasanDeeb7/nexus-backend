export function paginate(req, res, next) {
  const pageNumber = req.query.pageNumber;
  const pageSize = req.query.pageSize;
  if (pageSize && pageNumber) {
    const offset = pageSize * (pageNumber - 1);
    const limit = pageSize;
    req.offset = offset;
    req.limit = Number(limit);
    next();
  } else {
    res.status(400).json("Page number and size required");
  }
}
