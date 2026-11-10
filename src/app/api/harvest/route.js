import { collectionRoute } from "@/lib/crud-route";
import { validateHarvest } from "@/lib/validations";
import * as svc from "@/services/harvest.service";

export const { GET, POST } = collectionRoute("harvest", validateHarvest, svc);