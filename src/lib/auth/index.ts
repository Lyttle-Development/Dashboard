import {NextApiRequest, NextApiResponse} from 'next';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/pages/api/auth/[...nextauth]';

/**
 * Helper function to get the authenticated session in API routes.
 * If the session does not exist, return a 401 response.
 */
export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const token = req.headers.authorization?.split(" ")[1];
    if (!session && !token) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }

    // Check user is allowed
    const isAllowed =
      isAllowedUser(session) || token === process.env.AUTH_TOKEN;
    if (!isAllowed) {
      res.status(403).json({ error: "Forbidden" });
      return null;
    }

    return session;
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    return null;
  }
}

export function isAllowedUser(session: any) {
  // Check if the user is an allowed user by id & env variable
  const allowedUserIds = process.env.ALLOWED_USER_IDS?.split(";") ?? [];
  return allowedUserIds.includes(session.user.id);
}

export function isAdmin(session: any) {
  // Check if the user is an admin by email & env variable
  const adminEmails = process.env.ADMIN_EMAILS?.split(";") ?? [
    "132487290835435521", // Stualyttle Kirry
  ];
  return adminEmails.includes(session.user.id);
}

export function isManager(session: any) {
  // Check if the user is a manager by email & env variable
  const managerEmails = process.env.MANAGER_EMAILS?.split(";") ?? [
    "132487290835435521", // Stualyttle Kirry
    "469271199143428099", // Lmikha
  ];
  return managerEmails.includes(session.user.id);
}
