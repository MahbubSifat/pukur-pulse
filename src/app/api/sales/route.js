import { collectionRoute } from "@/lib/crud-route";
import { validateSale } from "@/lib/validations";
import * as svc from "@/services/sales.service";

export const { GET, POST } = collectionRoute("sales", validateSale, svc);