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
          ? "bg-success/10 border-success/30 text-success"
          : "bg-danger/10 border-danger/30 text-danger"
      }`}
    >
      {success ?? error}
    </div>
  );
}
