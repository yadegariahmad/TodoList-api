exports.errorHandler = error =>
{
  if (!error.statusCode)
  {
    error.statusCode = 500;
  }

  return error;
}