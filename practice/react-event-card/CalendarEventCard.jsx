// practice/react-event-card/CalendarEventCard.jsx
// Component hiển thị Thẻ sự kiện lịch cá nhân (Module TV2 - StudySync)

const { useState } = React;

/**
 * CalendarEventCard: Hiển thị thông tin một lịch học / sự kiện
 * 
 * @param {Object} props
 * @param {string} props.title - Tiêu đề sự kiện / tên môn học
 * @param {string} props.courseCode - Mã môn học (ví dụ: CSC13002)
 * @param {string} props.time - Thời gian diễn ra
 * @param {string} props.location - Phòng học hoặc link học online
 * @param {string} props.type - Phân loại: "Học tập" | "Họp nhóm" | "Thi cử"
 * @param {string} props.priority - Mức độ ưu tiên: "Cao" | "Trung bình" | "Thấp"
 * @param {string} props.notes - Ghi chú thêm
 */
function CalendarEventCard({ 
  title, 
  courseCode, 
  time, 
  location, 
  type = "Học tập", 
  priority = "Trung bình",
  notes = ""
}) {
  // 1. STATE: Quản lý trạng thái hoàn thành của sự kiện
  const [isCompleted, setIsCompleted] = useState(false);

  // 2. STATE: Quản lý trạng thái mở rộng để xem chi tiết ghi chú
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper: Xác định màu sắc nhãn theo loại sự kiện
  const getTypeBadgeColor = (t) => {
    switch (t) {
      case "Họp nhóm":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Thi cử":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  // Helper: Xác định màu viền theo mức độ ưu tiên
  const getPriorityBadgeColor = (p) => {
    switch (p) {
      case "Cao":
        return "bg-red-50 text-red-600 border-red-200";
      case "Thấp":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-amber-50 text-amber-600 border-amber-200";
    }
  };

  return (
    <div 
      className={`relative rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
        isCompleted 
          ? "bg-slate-50 border-emerald-300 opacity-80" 
          : "bg-white border-slate-200"
      }`}
    >
      {/* Header thẻ: Huy hiệu phân loại & Nút trạng thái */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getTypeBadgeColor(type)}`}>
            {type}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getPriorityBadgeColor(priority)}`}>
            Ưu tiên: {priority}
          </span>
          {courseCode && (
            <span className="text-xs text-slate-500 font-mono">
              [{courseCode}]
            </span>
          )}
        </div>

        {/* Nút bấm chuyển đổi State (Đã xong / Chưa xong) */}
        <button
          onClick={() => setIsCompleted(!isCompleted)}
          title={isCompleted ? "Đánh dấu chưa xong" : "Đánh dấu đã hoàn thành"}
          className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {isCompleted ? "✓ Đã xong" : "○ Đánh dấu xong"}
        </button>
      </div>

      {/* Tiêu đề sự kiện */}
      <h3 
        className={`text-base font-semibold leading-snug mb-2 ${
          isCompleted ? "line-through text-slate-400" : "text-slate-800"
        }`}
      >
        {title}
      </h3>

      {/* Thông tin chi tiết: Thời gian & Địa điểm */}
      <div className="space-y-1.5 text-sm text-slate-600 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">⏰</span>
          <span className="font-medium text-slate-700">{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">📍</span>
          <span>{location}</span>
        </div>
      </div>

      {/* Phần xem thêm ghi chú (Minh họa conditional rendering với State) */}
      {notes && (
        <div className="border-t border-slate-100 pt-2 mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            {isExpanded ? "▲ Thu gọn ghi chú" : "▼ Xem ghi chú"}
          </button>

          {isExpanded && (
            <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
              {notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
