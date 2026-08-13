import { createEmployee, deleteEmployee, listEmployeeAttendance, listEmployees, listSalaryPayments, payEmployeeSalary, recordEmployeeAttendance, SqliteValidationError, updateEmployee, updateSalaryPayment } from "@/lib/sqlite";
import { AccountAuthenticationError, withAccountDatabase } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  const status = error instanceof AccountAuthenticationError ? error.status : error instanceof SqliteValidationError || error instanceof SyntaxError ? 400 : 500;
  return Response.json({ error: message }, { status });
}
export async function GET(request: Request) {
  try { return withAccountDatabase(request, () => Response.json({ employees: listEmployees(), attendance: listEmployeeAttendance(), salaryPayments: listSalaryPayments() }, { headers: { "Cache-Control": "no-store" } })); } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try { return await withAccountDatabase(request, async () => { const input = await request.json() as Record<string, unknown>; if (input.action === "attendance") return Response.json({ attendance: recordEmployeeAttendance(input) }, { status: 201 }); if (input.action === "pay_salary") return Response.json(payEmployeeSalary(input), { status: 201 }); return Response.json({ employee: createEmployee(input) }, { status: 201 }); }); } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try { return await withAccountDatabase(request, async () => { const input = await request.json() as Record<string, unknown>; if (input.action === "update_salary") return Response.json(updateSalaryPayment(input)); return Response.json({ employee: updateEmployee(input) }); }); } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request) {
  try { return await withAccountDatabase(request, async () => { const input = await request.json() as { id?: unknown }; return Response.json({ employee: deleteEmployee(input.id) }); }); } catch (error) { return errorResponse(error); }
}
