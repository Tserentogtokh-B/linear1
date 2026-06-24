// Файлын хэмжээг хүн уншихуйц болгоно (ж: "2.3 MB")
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Энгийн харьцангуй огноо (ж: "5 мин өмнө")
export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "саяхан";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин өмнө`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} цаг өмнө`;
  return new Date(iso).toLocaleDateString();
}
