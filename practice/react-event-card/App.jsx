// practice/react-event-card/App.jsx
// Component chính demo cách truyền dữ liệu (Props) vào CalendarEventCard
// Tác giả: Đào Ngọc Hưng (MSSV: 24120319) - Issue #12

const { useState } = React;

function App() {
  // Dữ liệu mẫu (Mock data) mô phỏng lịch học cá nhân của sinh viên
  const initialEvents = [
    {
      id: 1,
      title: "Nhập môn Công nghệ Phần mềm - Lý thuyết",
      courseCode: "CSC13002",
      time: "Thứ Bảy, 07:30 - 11:00",
      location: "E211 (Cơ sở 2)",
      type: "Học tập",
      priority: "Cao",
      notes: "Cần đọc trước slide kiến trúc phần mềm và chuẩn bị câu hỏi thảo luận nhóm."
    },
    {
      id: 2,
      title: "Họp nhóm StudySync hàng tuần",
      courseCode: "TEAM-05",
      time: "Thứ Năm, 20:00 - 21:30",
      location: "Google Meet",
      type: "Họp nhóm",
      priority: "Cao",
      notes: "Kiểm tra tiến độ Tuần 1: Rà soát GitHub Projects, thống nhất user story cho TV2 và chuẩn bị tài liệu SRS."
    },
    {
      id: 3,
      title: "Mạng máy tính - Thực hành Lab 2",
      courseCode: "CSC10008",
      time: "Thứ Sáu, 13:30 - 16:30",
      location: "Phòng máy C.31",
      type: "Học tập",
      priority: "Trung bình",
      notes: "Nộp báo cáo cấu hình định tuyến tĩnh trước 23:59."
    }
  ];

  const [events] = useState(initialEvents);
  const [filterType, setFilterType] = useState("Tất cả");

  // Lọc danh sách theo loại sự kiện
  const filteredEvents = filterType === "Tất cả" 
    ? events 
    : events.filter(e => e.type === filterType);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header ứng dụng demo */}
        <header className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              StudySync • Module TV2 (Lịch cá nhân)
            </span>
            <span className="text-xs text-slate-400">Issue #12 Demo</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Thử nghiệm Component Thẻ Sự Kiện Lịch
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Người thực hiện: <strong className="text-slate-800">Đào Ngọc Hưng</strong> (MSSV: 24120319)
          </p>
        </header>

        {/* Thanh lọc loại sự kiện */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {["Tất cả", "Học tập", "Họp nhóm", "Thi cử"].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === type
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-auto">
            Hiển thị: <strong>{filteredEvents.length}</strong> sự kiện
          </span>
        </div>

        {/* Danh sách các component CalendarEventCard */}
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <CalendarEventCard
              key={event.id}
              title={event.title}
              courseCode={event.courseCode}
              time={event.time}
              location={event.location}
              type={event.type}
              priority={event.priority}
              notes={event.notes}
            />
          ))}
        </div>

        {/* Chú thích bài học kinh nghiệm */}
        <footer className="mt-8 bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
          <p className="font-semibold text-blue-900">💡 Kiến thức cốt lõi đã áp dụng:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Component & Props:</strong> Dữ liệu từ mảng <code>events</code> được truyền tuần tự vào từng thẻ qua props.</li>
            <li><strong>State (<code>useState</code>):</strong> Quản lý bộ lọc <code>filterType</code> ở App, và trạng thái <code>isCompleted</code> / <code>isExpanded</code> riêng biệt trong mỗi thẻ.</li>
            <li><strong>List Rendering:</strong> Dùng <code>.map()</code> kèm thuộc tính <code>key</code> duy nhất để tối ưu hiệu năng hiển thị danh sách.</li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
