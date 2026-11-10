import { collectionRoute } from "@/lib/crud-route";
import { validateExpense } from "@/lib/validations";
import * as svc from "@/services/expenses.service";

export const { GET, POST } = collectionRoute("expenses", validateExpense, svc);