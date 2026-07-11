"use server"

export async function verifyEditPassword(
  password: string,
): Promise<{ ok: boolean; configured: boolean }> {
  const expected = process.env.EDIT_PASSWORD

  if (!expected) {
    return { ok: false, configured: false }
  }

  return { ok: password === expected, configured: true }
}
