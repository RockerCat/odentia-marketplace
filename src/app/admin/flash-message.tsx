export default function FlashMessage({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  if (!success && !error) return null;

  return (
    <div
      className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
        success
          ? "bg-teal-50 border-teal-200 text-teal-800"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      {success ?? error}
    </div>
  );
}
