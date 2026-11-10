import { itemRoute } from "@/lib/crud-route";
import { validateExpense } from "@/lib/validations";
import * as svc from "@/services/expenses.service";

export const { GET, PATCH, DELETE } = itemRoute("expenses", validateExpense, svc);