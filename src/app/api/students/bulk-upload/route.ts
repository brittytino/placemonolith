import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/middleware/rbac';
import { handleError } from '@/lib/middleware/error-handler';
import { bulkUploadSchema } from '@/lib/validation/schemas/admin';
import { bulkCreateUsers } from '@/lib/db/queries/admin';

export async function POST(req: NextRequest) {
  try {
    const authError = await requireSuperAdmin(req);
    if (authError) return authError;

    const body = await req.json();
    const users = body.users || body.students;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request. Expected an array of users/students.'
      }, { status: 400 });
    }

    const result = await bulkCreateUsers(users);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Bulk upload completed. ${result.count} successful, ${result.failed.length} failed.`,
    });
  } catch (error) {
    return handleError(error);
  }
}
