module.exports = (model, currentPage, perPage) =>
{
  let totalItems;

  model.find()
    .countDocuments()
    .then(count =>
    {
      totalItems = count;
      const Response = model.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);

      return { totalItems, Response };
    });
}