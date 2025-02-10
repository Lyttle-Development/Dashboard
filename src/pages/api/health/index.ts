import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>,
): void {
  res.status(200).json({ status: 'ok' });
}
