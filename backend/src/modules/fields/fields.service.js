import { prisma } from "../../database/prisma.js";
import { listFields } from "./fields.repository.js";

export async function listFieldsService(filters) {
  return listFields(prisma, filters);
}
