// 예시)/users?page=1&limit=20
export const pagination = (req, res, next) => {
  const page = req.query.page ?? "1"; // 기본값: 1
  const limit = req.query.limit ?? "20" 
  const take = Number(limit) || 20; // 기본값(take): 20
  const skip = (Number(page) - 1) * take;

  //req에 take, skip 넣기
  req.take = take;
  req.skip = skip;

  next();
};