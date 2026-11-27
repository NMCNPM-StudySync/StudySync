/**
 * Dữ liệu giả cho trang Xếp lịch (TV3), CHỈ dùng khi chạy local với VITE_USE_MOCK=true.
 *
 * Mục đích: chụp ảnh giao diện cho PR khi backend thật chưa gọi được (api.ts chưa gắn middleware
 * xác thực cho /tasks, /schedule, /scheduler). Mock nhận đúng phương thức, đường dẫn và trả đúng vỏ
 * JSON của docs/api.md ({ data, warnings } hoặc { error }). Không dùng ở bản build (xem schedulerApi.ts).
 *
 * Tình huống: mặc định có đề xuất; thêm ?mock=empty vào URL để engine "không tìm được khung giờ".
 * Dữ liệu sống trong bộ nhớ, tải lại trang là về trạng thái đầu.
 *
 * Issue #146 — Module TV3
 */
import type { ApiErrorDetail, ApiResponse } from '../types/api';
import { ApiError } from './apiClient';
import type {
  AutoPlanResult,
  ConfirmResult,
  Proposal,
  ProposalSlot,
  SchedulerTask,
  StudySlot,
  TaskListResult,
  TaskResult,
  WeekScheduleResult,
} from '../types/scheduler';

export type SchedulerMockScenario = 'default' | 'empty';

export interface MockHttpResponse {
  status: number;
  body: unknown;
}

/** Giờ Việt Nam "2026-11-28 17:00" → ISO UTC có hậu tố Z (dữ liệu mẫu nhập theo giờ Việt Nam, BR-07). */
function vn(text: string): string {
  return new Date(`${text.replace(' ', 'T')}:00+07:00`).toISOString();
}

const USER_ID = '0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10';
const CREATED_AT = vn('2026-11-20 09:00');

interface MockTask extends SchedulerTask {
  createdAt: string;
  updatedAt: string;
}

interface MockFixedEvent {
  id: string;
  title: string;
  kind: 'class' | 'exam' | 'work_shift' | 'other';
  startsAt: string;
  endsAt: string;
  location: string | null;
  notes: string | null;
  source: 'manual' | 'ics' | 'csv';
  hasOverlap: boolean;
}

function task(
  id: string,
  title: string,
  dueAt: string,
  priority: SchedulerTask['priority'],
  difficulty: SchedulerTask['difficulty'],
  durationMinutes: number,
): MockTask {
  return {
    id,
    title,
    dueAt: vn(dueAt),
    priority,
    difficulty,
    durationMinutes,
    isDone: false,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

function fixed(
  id: string,
  title: string,
  kind: MockFixedEvent['kind'],
  from: string,
  to: string,
  location: string,
): MockFixedEvent {
  return {
    id,
    title,
    kind,
    startsAt: vn(from),
    endsAt: vn(to),
    location,
    notes: null,
    source: 'manual',
    hasOverlap: false,
  };
}

const TASK_IDS = {
  calculus: '55555555-6666-4777-8888-000000000001',
  report: '55555555-6666-4777-8888-000000000002',
  erd: '55555555-6666-4777-8888-000000000003',
  slides: '55555555-6666-4777-8888-000000000004',
  testing: '55555555-6666-4777-8888-000000000005',
  probability: '55555555-6666-4777-8888-000000000006',
} as const;

/** Việc cần làm của sinh viên mẫu (tuần 48, 23–29/11/2026). */
function initialTasks(): MockTask[] {
  return [
    task(TASK_IDS.calculus, 'Ôn thi Giải tích', '2026-11-30 23:00', 'high', 'hard', 120),
    task(TASK_IDS.report, 'Nộp báo cáo yêu cầu M3', '2026-11-29 17:00', 'high', 'medium', 120),
    task(TASK_IDS.erd, 'Sửa ERD module TV3', '2026-12-01 20:00', 'medium', 'easy', 60),
    task(TASK_IDS.slides, 'Chuẩn bị slide demo', '2026-12-02 12:00', 'low', 'medium', 90),
    task(TASK_IDS.testing, 'Đọc tài liệu kiểm thử', '2026-12-03 22:00', 'low', 'easy', 45),
    // Việc đã có khung "Đã xếp" trong tuần nên không nằm trong danh sách chờ
    task(TASK_IDS.probability, 'Ôn chương 2 Xác suất', '2026-11-28 23:00', 'medium', 'medium', 90),
  ];
}

/** Sự kiện cố định trong tuần: khung đề xuất bên dưới đều tránh các khoảng này (BR-01). */
function initialFixedEvents(): MockFixedEvent[] {
  return [
    fixed(
      '11111111-2222-4333-8444-000000000001',
      'Nhập môn CNPM',
      'class',
      '2026-11-23 13:00',
      '2026-11-23 15:00',
      'B1.04',
    ),
    fixed(
      '11111111-2222-4333-8444-000000000002',
      'Thi giữa kỳ Giải tích',
      'exam',
      '2026-11-24 13:00',
      '2026-11-24 15:00',
      'Hội trường',
    ),
    fixed(
      '11111111-2222-4333-8444-000000000003',
      'Thực hành CNPM',
      'class',
      '2026-11-28 07:30',
      '2026-11-28 11:30',
      'Lab 2',
    ),
    fixed(
      '11111111-2222-4333-8444-000000000004',
      'Ca làm thêm',
      'work_shift',
      '2026-11-28 13:00',
      '2026-11-28 17:00',
      'Quán cà phê',
    ),
    fixed(
      '11111111-2222-4333-8444-000000000005',
      'Học nhóm đồ án',
      'other',
      '2026-11-29 08:00',
      '2026-11-29 10:00',
      'Thư viện',
    ),
    fixed(
      '11111111-2222-4333-8444-000000000006',
      'Ca làm thêm',
      'work_shift',
      '2026-11-29 15:30',
      '2026-11-29 18:30',
      'Quán cà phê',
    ),
  ];
}

/** Khung trên lịch tuần lúc đầu: một khung "Đã xếp", một khung "Bỏ lỡ". */
function initialSlots(): StudySlot[] {
  return [
    {
      id: 'b2b2b2b2-0000-4000-8000-000000000001',
      taskId: TASK_IDS.probability,
      taskTitle: 'Ôn chương 2 Xác suất',
      startsAt: vn('2026-11-25 20:00'),
      endsAt: vn('2026-11-25 21:30'),
      status: 'scheduled',
      needsReschedule: false,
    },
    {
      id: 'b2b2b2b2-0000-4000-8000-000000000002',
      taskId: TASK_IDS.calculus,
      taskTitle: 'Ôn thi Giải tích',
      startsAt: vn('2026-11-24 20:00'),
      endsAt: vn('2026-11-24 21:30'),
      status: 'missed',
      needsReschedule: false,
    },
  ];
}

/**
 * Khung engine "đề xuất" cho từng việc: trong 07:00–22:00, mỗi khung 30–120 phút, không giao sự kiện
 * cố định ở trên, mỗi ngày không quá 4 giờ (Thứ Bảy 225 phút, Chủ nhật 210 phút), trước hạn chót.
 */
const PLAN: Record<string, { from: string; to: string }> = {
  [TASK_IDS.report]: { from: '2026-11-28 17:30', to: '2026-11-28 19:30' },
  [TASK_IDS.calculus]: { from: '2026-11-29 10:00', to: '2026-11-29 12:00' },
  [TASK_IDS.erd]: { from: '2026-11-28 19:30', to: '2026-11-28 20:30' },
  [TASK_IDS.slides]: { from: '2026-11-29 13:30', to: '2026-11-29 15:00' },
  [TASK_IDS.testing]: { from: '2026-11-28 21:00', to: '2026-11-28 21:45' },
};

/** Thứ tự xếp như engine: độ ưu tiên giảm dần, hạn chót sớm trước, độ khó giảm dần. */
const PRIORITY_RANK = { high: 3, medium: 2, low: 1 } as const;
const DIFFICULTY_RANK = { hard: 3, medium: 2, easy: 1 } as const;

const BASE_FREE_MINUTES = 1380;
const MS_PER_MINUTE = 60_000;

interface MockState {
  tasks: MockTask[];
  fixedEvents: MockFixedEvent[];
  slots: StudySlot[];
  pending: Proposal | null;
  /** Kết quả accept đã trả, để bấm lần hai trả đúng kết quả cũ (yêu cầu 3.8). */
  accepted: Map<string, ConfirmResult>;
  /** Mọi lượt đã tạo: lượt cũ trả 409 proposal_closed, mã lạ trả 404. */
  knownProposalIds: Set<string>;
  seq: number;
}

function minutesBetween(startsAt: string, endsAt: string): number {
  return Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / MS_PER_MINUTE);
}

function error(
  status: number,
  code: string,
  message: string,
  details?: unknown[],
): MockHttpResponse {
  return { status, body: { error: details ? { code, message, details } : { code, message } } };
}

/**
 * Tạo một "máy chủ giả" độc lập. Trang dùng một bản chung (schedulerApi.ts);
 * test tạo bản mới để không ảnh hưởng nhau.
 */
export function createSchedulerMockServer(readScenario: () => SchedulerMockScenario) {
  const state: MockState = {
    tasks: initialTasks(),
    fixedEvents: initialFixedEvents(),
    slots: initialSlots(),
    pending: null,
    accepted: new Map(),
    knownProposalIds: new Set(),
    seq: 0,
  };

  const nextId = (prefix: string) => {
    state.seq += 1;
    return `${prefix}-0000-4000-8000-${String(state.seq).padStart(12, '0')}`;
  };

  const openTasks = () => state.tasks.filter((t) => !t.isDone);

  /** Việc chưa hoàn thành và chưa có khung "Đã xếp"/"Đã học". */
  const tasksNeedingSlots = () => {
    const covered = new Set(
      state.slots
        .filter((s) => s.status === 'scheduled' || s.status === 'studied')
        .map((s) => s.taskId),
    );
    return openTasks()
      .filter((t) => !covered.has(t.id))
      .sort(
        (a, b) =>
          PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
          Date.parse(a.dueAt) - Date.parse(b.dueAt) ||
          DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty],
      );
  };

  /** Thời gian trống giảm đúng bằng số phút vừa được chấp nhận; tình huống empty là 0. */
  const freeMinutes = () => {
    if (readScenario() === 'empty') return 0;
    const used = [...state.accepted.values()]
      .flatMap((result) => result.savedSlots)
      .reduce((sum, s) => sum + minutesBetween(s.startsAt, s.endsAt), 0);
    return Math.max(0, BASE_FREE_MINUTES - used);
  };

  function getTasks(): MockHttpResponse {
    const data: TaskListResult = {
      tasks: [...openTasks()].sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt)),
    };
    return { status: 200, body: { data } };
  }

  function getWeek(query: URLSearchParams): MockHttpResponse {
    const weekStart = query.get('weekStart');
    if (!weekStart || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(weekStart)) {
      return error(
        400,
        'VALIDATION_ERROR',
        'Tham số weekStart phải là chuỗi ISO 8601 UTC có hậu tố Z',
        [{ field: 'weekStart', issue: 'phải theo chuẩn ISO 8601 UTC kết thúc bằng Z' }],
      );
    }
    const from = Date.parse(weekStart);
    const to = from + 7 * 24 * 60 * MS_PER_MINUTE;
    const inWeek = (s: { startsAt: string; endsAt: string }) =>
      Date.parse(s.endsAt) > from && Date.parse(s.startsAt) < to;
    const data: WeekScheduleResult & { fixedEvents: MockFixedEvent[] } = {
      weekStart: new Date(from).toISOString(),
      weekEnd: new Date(to).toISOString(),
      fixedEvents: state.fixedEvents.filter(inWeek),
      tasks: openTasks().filter((t) => Date.parse(t.dueAt) >= from && Date.parse(t.dueAt) < to),
      // Khung proposed không bao giờ hiện trên lịch tuần (BR-03)
      studySlots: state.slots
        .filter(inWeek)
        .map(({ id, taskId, taskTitle, startsAt, endsAt, status }) => ({
          id,
          taskId,
          taskTitle,
          startsAt,
          endsAt,
          status,
        })),
    };
    return { status: 200, body: { data } };
  }

  function postAutoPlan(): MockHttpResponse {
    const needing = tasksNeedingSlots();
    if (needing.length === 0) {
      const data: AutoPlanResult = { proposal: null, freeMinutes: freeMinutes() };
      return {
        status: 200,
        body: {
          data,
          warnings: [
            { code: 'NO_TASKS_TO_SCHEDULE', message: 'Không có việc cần làm để xếp lịch' },
          ],
        },
      };
    }

    const empty = readScenario() === 'empty';
    const proposalId = nextId('a1a1a1a1');
    const slots: ProposalSlot[] = [];
    const taskResults: TaskResult[] = [];
    for (const t of needing) {
      const planned = empty ? undefined : PLAN[t.id];
      if (!planned) {
        taskResults.push({
          taskId: t.id,
          taskTitle: t.title,
          result: 'not_enough_time',
          proposedMinutes: 0,
          missingMinutes: t.durationMinutes,
        });
        continue;
      }
      const startsAt = vn(planned.from);
      const endsAt = vn(planned.to);
      slots.push({
        id: nextId('c3c3c3c3'),
        taskId: t.id,
        taskTitle: t.title,
        startsAt,
        endsAt,
        replacesSlot: null,
      });
      taskResults.push({
        taskId: t.id,
        taskTitle: t.title,
        result: 'full',
        proposedMinutes: minutesBetween(startsAt, endsAt),
        missingMinutes: 0,
      });
    }
    slots.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

    // Lượt chờ cũ (nếu có) bị thay bằng lượt mới
    state.knownProposalIds.add(proposalId);
    state.pending = {
      id: proposalId,
      kind: 'auto_plan',
      status: 'pending',
      createdAt: new Date().toISOString(),
      slots,
      taskResults,
      missedSlotId: null,
    };
    const data: AutoPlanResult = { proposal: state.pending, freeMinutes: freeMinutes() };
    return { status: 200, body: { data } };
  }

  function postConfirm(body: unknown): MockHttpResponse {
    const input = (typeof body === 'object' && body !== null ? body : {}) as Record<
      string,
      unknown
    >;
    const { proposalId, action } = input;
    if (typeof proposalId !== 'string' || proposalId === '') {
      return error(400, 'VALIDATION_ERROR', 'Thiếu mã lượt đề xuất', [
        { field: 'proposalId', issue: 'bắt buộc' },
      ]);
    }
    if (action !== 'accept' && action !== 'reject') {
      return error(400, 'VALIDATION_ERROR', 'Hành động chỉ nhận accept hoặc reject', [
        { field: 'action', issue: 'ngoài danh mục' },
      ]);
    }

    const previous = state.accepted.get(proposalId);
    if (previous && action === 'accept') return { status: 200, body: { data: previous } };

    if (!state.pending || state.pending.id !== proposalId) {
      if (!state.knownProposalIds.has(proposalId)) {
        return error(404, 'NOT_FOUND', 'Không tìm thấy lượt đề xuất');
      }
      return error(409, 'CONFLICT', 'Lượt đề xuất không còn ở trạng thái chờ', [
        { field: 'proposalId', issue: 'proposal_closed' },
      ]);
    }

    const proposal = state.pending;
    state.pending = null;
    if (action === 'reject') {
      const data: ConfirmResult = {
        proposalId,
        status: 'rejected',
        savedSlots: [],
        removedSlotIds: [],
      };
      return { status: 200, body: { data } };
    }

    const savedSlots: StudySlot[] = proposal.slots.map((s) => ({
      id: s.id,
      taskId: s.taskId,
      taskTitle: s.taskTitle,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      status: 'scheduled',
      needsReschedule: false,
    }));
    state.slots.push(...savedSlots);
    const data: ConfirmResult = {
      proposalId,
      status: 'accepted',
      savedSlots,
      removedSlotIds: [],
    };
    state.accepted.set(proposalId, data);
    return { status: 200, body: { data } };
  }

  /** Xử lý một yêu cầu như backend: method + đường dẫn sau /api (có thể kèm query). */
  function handle(method: 'GET' | 'POST', path: string, body?: unknown): MockHttpResponse {
    const [pathname = '', search = ''] = path.split('?');
    const query = new URLSearchParams(search);
    if (method === 'GET' && pathname === '/tasks') return getTasks();
    if (method === 'GET' && pathname === '/schedule/week') return getWeek(query);
    if (method === 'POST' && pathname === '/scheduler/auto-plan') return postAutoPlan();
    if (method === 'POST' && pathname === '/scheduler/confirm') return postConfirm(body);
    return error(404, 'NOT_FOUND', `Mock chưa hỗ trợ ${method} ${pathname}`);
  }

  return { handle, userId: USER_ID };
}

type MockServer = ReturnType<typeof createSchedulerMockServer>;

/**
 * HTTP client giả có cùng giao diện get/post với apiClient: dựng query giống apiClient, đi qua
 * JSON như mạng thật, trả { data, warnings } hoặc ném ApiError(message, status, code, details).
 */
export function createSchedulerMockHttpClient(server: MockServer, delayMs = 350) {
  const send = async <T>(
    method: 'GET' | 'POST',
    endpoint: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> => {
    // Độ trễ nhỏ để thấy trạng thái "đang tải" khi chụp ảnh
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
    const requestBody = body === undefined ? undefined : JSON.parse(JSON.stringify(body));
    const res = server.handle(method, endpoint, requestBody);
    const payload = JSON.parse(JSON.stringify(res.body)) as {
      data?: T;
      warnings?: ApiResponse<T>['warnings'];
      error?: { code: string; message: string; details?: ApiErrorDetail[] };
    };
    if (res.status >= 400 || payload.error) {
      throw new ApiError(
        payload.error?.message ?? 'Yêu cầu không thành công',
        res.status,
        payload.error?.code ?? 'UNKNOWN_ERROR',
        payload.error?.details,
      );
    }
    return { data: payload.data as T, warnings: payload.warnings ?? [] };
  };

  return {
    get<T>(
      endpoint: string,
      options?: { params?: Record<string, string | number | boolean | undefined | null> },
    ): Promise<ApiResponse<T>> {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(options?.params ?? {})) {
        if (value !== undefined && value !== null) query.append(key, String(value));
      }
      const search = query.toString();
      return send<T>('GET', search ? `${endpoint}?${search}` : endpoint);
    },
    post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
      return send<T>('POST', endpoint, body);
    },
  };
}

/** Đọc tình huống từ URL: ?mock=empty thì engine không tìm được khung giờ nào. */
export function readScenarioFromLocation(): SchedulerMockScenario {
  if (typeof window === 'undefined') return 'default';
  return new URLSearchParams(window.location.search).get('mock') === 'empty' ? 'empty' : 'default';
}
