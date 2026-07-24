import { useEffect, useState } from "react";
import { getBrochureDownloads } from "@/services/orderService";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <svg
        className="animate-spin text-stone-300"
        width={36}
        height={36}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.4"
        />
        <path
          d="M12 4.8a7.2 7.2 0 1 1-6.4 3.9"
          stroke="#9d7c5b"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function BrochureDownloads() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getBrochureDownloads()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.downloads)
              ? data.downloads
              : [];
        setRows(list);
      })
      .catch(() => setError("Could not load brochure downloads. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-900">Brochure Downloads</h1>
        </div>

        {loading && <Spinner />}

        {!loading && error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white px-6 py-16 text-center">
            <p className="text-sm text-stone-400">No brochure downloads recorded yet.</p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="divide-y divide-stone-100 sm:hidden">
              {rows.map((row, idx) => (
                <div key={row.id ?? idx} className="px-4 py-4">
                  <p className="text-sm font-semibold text-stone-900">
                    {row.first_name} {row.last_name}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">{row.email}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{row.mobile}</p>
                  <p className="mt-1.5 text-[10px] text-stone-400">
                    {formatDate(row.created_at ?? row.date)}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                      #
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                      Name
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                      Email
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                      Mobile
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {rows.map((row, idx) => (
                    <tr key={row.id ?? idx} className="transition-colors hover:bg-stone-50/80">
                      <td className="px-5 py-3.5 text-xs text-stone-400">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-stone-800">
                        {row.first_name} {row.last_name}
                      </td>
                      <td className="px-5 py-3.5 text-stone-500">{row.email || "—"}</td>
                      <td className="px-5 py-3.5 text-stone-500">{row.mobile || "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-stone-400">
                        {formatDate(row.created_at ?? row.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-stone-100 px-5 py-3">
                <p className="text-xs text-stone-400">
                  {rows.length} {rows.length === 1 ? "person" : "people"} downloaded the brochure
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
