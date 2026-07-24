import { useEffect, useMemo, useState } from "react";
import {
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import * as XLSX from "xlsx";
import { getBrochureDownloads } from "@/services/orderService";

const ACCENT = "#9D7C5B";

const AVATAR_TINTS = [
  { bg: "#F3E7DA", fg: "#9D6B3C" },
  { bg: "#E7EEE8", fg: "#4C7A64" },
  { bg: "#EDE6F2", fg: "#7A5C9E" },
  { bg: "#E6EEF2", fg: "#3E7690" },
  { bg: "#F2E6E6", fg: "#A15353" },
];

function tintFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

function initials(first, last) {
  const a = (first || "").trim()[0] || "";
  const b = (last || "").trim()[0] || "";
  return (a + b).toUpperCase() || "—";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function BrochureDownloads() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getBrochureDownloads()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.downloads)
              ? data.downloads
              : [];
        setRows(list);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load brochure downloads. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const haystack =
        `${row.first_name ?? ""} ${row.last_name ?? ""} ${row.email ?? ""} ${row.mobile ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  const exportExcel = () => {
    const data = filteredRows.map((row) => ({
      "First name": row.first_name ?? "",
      "Last name": row.last_name ?? "",
      Email: row.email ?? "",
      Mobile: row.mobile ?? "",
      Date: formatDate(row.created_at ?? row.date),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = [{ wch: 16 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 14 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Brochure Downloads");
    XLSX.writeFile(workbook, "brochure-downloads.xlsx");
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      height: 42,
      borderRadius: 999,
      bgcolor: "#fff",
      "& fieldset": { borderColor: "#E7E1D6" },
      "&:hover fieldset": { borderColor: "#C9AE8C" },
      "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1.5 },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-[960px]">
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-[22px] font-semibold tracking-tight text-[#1c1a17] sm:text-[28px]">
              Brochure Downloads
            </h1>
            <p className="text-sm text-stone-500">
              {loading
                ? "Fetching the latest activity…"
                : `${rows.length} ${rows.length === 1 ? "person has" : "people have"} downloaded the brochure`}
            </p>
          </div>

          {!loading && !error && rows.length > 0 && (
            <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, mobile"
                size="small"
                fullWidth
                sx={{ ...fieldSx, width: { xs: "100%", sm: 260 }, flexShrink: 0 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 19, color: "#A8A29E" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                onClick={exportExcel}
                variant="contained"
                disableElevation
                startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 17 }} />}
                sx={{
                  height: 42,
                  bgcolor: "#1c1a17",
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: 13.5,
                  px: 2.25,
                  minWidth: { xs: "100%", sm: "fit-content" },
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  "&:hover": { bgcolor: "#332f29" },
                }}
              >
                Export Excel
              </Button>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E7E1D6] bg-white py-16">
            <CircularProgress size={32} thickness={4} sx={{ color: ACCENT }} />
            <p className="text-xs tracking-wide text-stone-400">Loading downloads…</p>
          </div>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            variant="outlined"
            action={
              <Button
                onClick={() => setReloadKey((k) => k + 1)}
                size="small"
                startIcon={<RefreshRoundedIcon />}
                sx={{ textTransform: "none", fontWeight: 500 }}
              >
                Retry
              </Button>
            }
            sx={{ borderRadius: 3, alignItems: "center" }}
          >
            <AlertTitle sx={{ fontSize: 14, fontWeight: 600 }}>Something went wrong</AlertTitle>
            {error}
          </Alert>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E7E1D6] bg-white px-6 py-16 text-center sm:py-24">
            <Avatar sx={{ bgcolor: "#F1EEE8", color: "#A8A29E", width: 48, height: 48 }}>
              <Inventory2RoundedIcon />
            </Avatar>
            <p className="text-[15px] font-semibold text-stone-700">No brochure downloads yet</p>
            <p className="max-w-[320px] text-[13px] leading-relaxed text-stone-500">
              Once someone downloads the brochure from your site, their details will show up here.
            </p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            {filteredRows.length === 0 ? (
              <div className="rounded-2xl border border-[#E7E1D6] bg-white py-8 text-center">
                <p className="text-sm text-stone-400">No results for "{query}"</p>
              </div>
            ) : (
              <>
                <div className="flex max-h-[480px] flex-col gap-3 overflow-y-auto pr-1 sm:hidden">
                  {filteredRows.map((row, idx) => {
                    const tint = tintFor(`${row.first_name}${row.last_name}${idx}`);
                    return (
                      <div
                        key={row.id ?? idx}
                        className="rounded-xl border border-[#E7E1D6] bg-white p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            sx={{
                              bgcolor: tint.bg,
                              color: tint.fg,
                              fontSize: 13,
                              fontWeight: 700,
                              width: 38,
                              height: 38,
                            }}
                          >
                            {initials(row.first_name, row.last_name)}
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#1c1a17]">
                              {row.first_name} {row.last_name}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <MailOutlineRoundedIcon sx={{ fontSize: 14, color: "#A8A29E" }} />
                              <p className="truncate text-[12.5px] text-stone-500">
                                {row.email || "—"}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <LocalPhoneRoundedIcon sx={{ fontSize: 13, color: "#A8A29E" }} />
                              <p className="text-[12.5px] text-stone-500">{row.mobile || "—"}</p>
                            </div>
                          </div>
                          <Chip
                            icon={<CalendarMonthRoundedIcon sx={{ fontSize: "14px !important" }} />}
                            label={formatDate(row.created_at ?? row.date)}
                            size="small"
                            sx={{ bgcolor: "#F5F1EA", color: "#8a7565", fontSize: 11, height: 24 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="hidden overflow-auto rounded-2xl border border-[#E7E1D6] bg-white sm:block"
                  style={{ maxHeight: 480 }}
                >
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="sticky top-0 z-10 bg-[#FAF7F2]">
                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-stone-400">
                          Name
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-stone-400">
                          Email
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-stone-400">
                          Mobile
                        </th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-stone-400">
                          Downloaded
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, idx) => {
                        const tint = tintFor(`${row.first_name}${row.last_name}${idx}`);
                        return (
                          <tr
                            key={row.id ?? idx}
                            className="border-t border-[#F1EEE8] hover:bg-[#FAF8F5]"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  sx={{
                                    bgcolor: tint.bg,
                                    color: tint.fg,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    width: 32,
                                    height: 32,
                                  }}
                                >
                                  {initials(row.first_name, row.last_name)}
                                </Avatar>
                                <span className="font-medium text-stone-800">
                                  {row.first_name} {row.last_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-stone-500">{row.email || "—"}</td>
                            <td className="px-5 py-3.5 text-stone-500">{row.mobile || "—"}</td>
                            <td className="px-5 py-3.5 text-right text-xs text-stone-400">
                              {formatDate(row.created_at ?? row.date)}{" "}
                              <span className="text-stone-300">
                                {formatTime(row.created_at ?? row.date)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="hidden rounded-b-2xl border border-t-0 border-[#E7E1D6] bg-white px-5 py-3 sm:block">
                  <p className="text-[12.5px] text-stone-400">
                    Showing {filteredRows.length} of {rows.length}{" "}
                    {rows.length === 1 ? "person" : "people"}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
