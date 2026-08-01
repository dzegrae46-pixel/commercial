import {
  createEmployee,
  deleteEmployee,
  listEmployeeAttendance,
  listEmployees,
  listSalaryPayments,
  payEmployeeSalary,
  recordEmployeeAttendance,
  SqliteValidationError,
  updateEmployee,
} from "@/lib/sqlite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Une erreur SQLite est survenue.";
  return Response.json(
    { error: message },
    { status: error instanceof SqliteValidationError || error instanceof SyntaxError ? 400 : 500 },
  );
}

export function GET() {
  try {
    return Response.json(
      {
        employees: listEmployees(),
        attendance: listEmployeeAttendance(),
        salaryPayments: listSalaryPayments(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    if (input.action === "attendance") {
      return Response.json({ attendance: recordEmployeeAttendance(input) }, { status: 201 });
    }
    if (input.action === "pay_salary") {
      return Response.json(payEmployeeSalary(input), { status: 201 });
    }
    return Response.json({ employee: createEmployee(input) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    return Response.json({ employee: updateEmployee(await request.json()) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const input = await request.json() as { id?: unknown };
    return Response.json({ employee: deleteEmployee(input.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
