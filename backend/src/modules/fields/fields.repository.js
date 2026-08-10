export function listFields(client, filters = {}) {
  return client.field.findMany({
    where: {
      isDeleted: false,
      ...(filters.active === undefined ? {} : { isActive: filters.active })
    },
    orderBy: { name: "asc" }
  });
}
