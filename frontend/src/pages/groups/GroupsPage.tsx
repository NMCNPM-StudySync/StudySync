import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card } from '../../components/ui';
import { ApiError, groupService } from '../../services';
import type { GroupSummary } from '../../types/group';
import { CreateGroupModal } from './components/CreateGroupModal';
import { GroupDetailPanel } from './components/GroupDetailPanel';

export function GroupsPage() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupService.list();
      setGroups(data);
      setSelectedId((cur) => cur ?? data[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu lần đầu khi mount
    void loadGroups();
  }, [loadGroups]);

  const handleCreated = (group: GroupSummary) => {
    setGroups((prev) => [group, ...prev]);
    setSelectedId(group.id);
    setCreateOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-[24px] font-bold text-brand-navy">Nhóm của tôi</h1>
        <Button onClick={() => setCreateOpen(true)}>Tạo nhóm mới</Button>
      </div>

      {loading && <p className="text-sm text-brand-muted">Đang tải danh sách nhóm...</p>}

      {error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-brand-alertText">
          <span className="font-medium">{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void loadGroups()}>
            Thử lại
          </Button>
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <Card variant="subtle">
          <p className="text-sm text-brand-navy">
            Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới hoặc dùng liên kết mời từ Trưởng nhóm.
          </p>
        </Card>
      )}

      {groups.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <ul className="flex flex-col gap-3" aria-label="Danh sách nhóm">
            {groups.map((g) => (
              <li key={g.id}>
                <Card
                  variant="interactive"
                  role="button"
                  tabIndex={0}
                  aria-pressed={g.id === selectedId}
                  className={
                    g.id === selectedId ? 'border-brand-primary ring-1 ring-brand-primary' : ''
                  }
                  onClick={() => setSelectedId(g.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(g.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-heading font-semibold">{g.name}</p>
                      <p className="text-xs text-brand-muted">{g.memberCount} thành viên</p>
                    </div>
                    <Badge variant={g.myRole === 'leader' ? 'default' : 'neutral'}>
                      {g.myRole === 'leader' ? 'Trưởng nhóm' : 'Thành viên'}
                    </Badge>
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <section aria-label="Chi tiết nhóm">
            {selectedId && <GroupDetailPanel key={selectedId} groupId={selectedId} />}
          </section>
        </div>
      )}

      <CreateGroupModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
