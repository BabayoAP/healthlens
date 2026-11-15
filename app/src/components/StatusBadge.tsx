import type { Status } from '../lib/types';

const label: Record<Status, string> = { ok: 'OK', watch: 'Watch', act: 'Act' };

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status}`}>{label[status]}</span>;
}
