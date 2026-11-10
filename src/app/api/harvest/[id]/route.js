import { itemRoute } from "@/lib/crud-route";
import { validateHarvest } from "@/lib/validations";
import * as svc from "@/services/harvest.service";

export const { GET, PATCH, DELETE } = itemRoute("harvest", validateHarvest, svc);