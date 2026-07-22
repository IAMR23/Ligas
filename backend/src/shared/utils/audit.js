export function toAuditJson(value) {
  if (value === undefined || value === null) {
    return null;
  }

  return JSON.parse(JSON.stringify(value));
}
