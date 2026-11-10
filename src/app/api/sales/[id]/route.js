import { itemRoute } from "@/lib/crud-route";
import { validateSale } from "@/lib/validations";
import * as svc from "@/services/sales.service";

export const { GET, PATCH, DELETE } = itemRoute("sales", validateSale, svc);