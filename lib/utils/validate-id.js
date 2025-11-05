function validateId(id) {
  const userId = Number.parseInt(id, 10);
  return Number.isNaN(userId) || userId <= 0;
}

export default validateId;
