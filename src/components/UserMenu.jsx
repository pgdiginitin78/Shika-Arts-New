import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/LoginServices";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "sonner";

const ACCENT = "#7A1F3D";

const MENU_ITEM_STYLES = {
  dashboard: { color: "#2F6FED", bg: "#EAF1FE" },
  brochure: { color: "#B4790F", bg: "#FBF1DD" },
  orders: { color: "#1E9E6C", bg: "#E6F7EF" },
  account: { color: "#7A5CC0", bg: "#F1EDFB" },
  signout: { color: "#D1414B", bg: "#FCEAEB" },
};

function IconChip({ icon, tone }) {
  const style = MENU_ITEM_STYLES[tone];
  return (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: style.bg,
        color: style.color,
      }}
    >
      {icon}
    </Box>
  );
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Failed to parse stored user, clearing it", e);
    localStorage.removeItem("user");
    return null;
  }
}

function getCustomerData() {
  try {
    const raw = localStorage.getItem("customerData");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function useStoredCustomerData() {
  const [data, setData] = useState(getCustomerData);

  useEffect(() => {
    const sync = () => setData(getCustomerData());
    window.addEventListener("user-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("user-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return data;
}

export function notifyUserChanged() {
  window.dispatchEvent(new Event("user-changed"));
}

function useStoredUser() {
  const [customer, setCustomer] = useState(getStoredUser);

  useEffect(() => {
    const sync = () => setCustomer(getStoredUser());
    window.addEventListener("user-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("user-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return customer;
}

export function UserMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const customer = useStoredUser();
  const customerData = useStoredCustomerData();
  const resetCart = useCartStore((s) => s.resetCart);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  const isSuperAdmin = customerData?.is_super_admin === true;

  const email = customer?.user_email || customer?.email || "";
  const displayName =
    customer?.user_display_name || customer?.display_name || customer?.user_nicename || "";
  const initials = (displayName?.[0] || email?.[0] || "U").toUpperCase();

  const handleLogout = async () => {
    setAnchorEl(null);
    logout();
    resetCart();
    clearWishlist();
    localStorage.clear();
    notifyUserChanged();
    navigate("/");
    toast.success("Logged out successfully!");
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        aria-label={`Account menu for ${displayName}`}
        sx={{
          p: 0.4,
          border: "2px solid transparent",
          transition: "border-color 0.2s ease",
          "&:hover": { borderColor: `${ACCENT}33` },
        }}
      >
        <Avatar
          src={customer?.imageUrl || undefined}
          alt={displayName}
          sx={{
            width: 34,
            height: 34,
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            background: `linear-gradient(135deg, ${ACCENT} 0%, #B0335C 100%)`,
            boxShadow: `0 2px 8px ${ACCENT}40`,
          }}
        >
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.25,
            minWidth: 250,
            borderRadius: 2.5,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "rgba(0,0,0,0.06)",
            boxShadow: "0 12px 32px rgba(15, 23, 22, 0.14)",
          },
        }}
        MenuListProps={{ sx: { pt: "0px !important", pb: "0px !important" } }}
      >
        <Box
          sx={{
            px: 2.25,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background: `linear-gradient(135deg, ${ACCENT}10 0%, ${ACCENT}03 100%)`,
          }}
        >
          <Avatar
            src={customer?.imageUrl || undefined}
            sx={{
              width: 42,
              height: 42,
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              background: `linear-gradient(135deg, ${ACCENT} 0%, #B0335C 100%)`,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1c1a17" }} noWrap>
              {displayName}
            </Typography>
            {email && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block" }}
                noWrap
              >
                {email}
              </Typography>
            )}
          </Box>
        </Box>
        <Divider />
        {isSuperAdmin && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/admin");
            }}
            sx={{ px: 2.25, py: 1.1, gap: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: "auto" }}>
              <IconChip tone="dashboard" icon={<DashboardRoundedIcon sx={{ fontSize: 17 }} />} />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </MenuItem>
        )}
        {isSuperAdmin && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/admin/brochure-downloads");
            }}
            sx={{ px: 2.25, py: 1.1, gap: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: "auto" }}>
              <IconChip tone="brochure" icon={<BookmarkRoundedIcon sx={{ fontSize: 17 }} />} />
            </ListItemIcon>
            <ListItemText
              primary="Brochure Downloads"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate("/my-orders");
          }}
          sx={{ px: 2.25, py: 1.1, gap: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <IconChip tone="orders" icon={<ShoppingBagRoundedIcon sx={{ fontSize: 17 }} />} />
          </ListItemIcon>
          <ListItemText
            primary="My Orders"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate("/profilePage");
          }}
          sx={{ px: 2.25, py: 1.1, gap: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <IconChip tone="account" icon={<PersonRoundedIcon sx={{ fontSize: 17 }} />} />
          </ListItemIcon>
          <ListItemText
            primary="My Account"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ px: 2.25, py: 1.1, gap: 1.5 }}>
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <IconChip tone="signout" icon={<LogoutRoundedIcon sx={{ fontSize: 17 }} />} />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 500,
              color: MENU_ITEM_STYLES.signout.color,
            }}
          />
        </MenuItem>
      </Menu>
    </>
  );
}

export function UserMenuInline({ onAfter }) {
  const navigate = useNavigate();
  const customer = useStoredUser();
  const customerData = useStoredCustomerData();
  const resetCart = useCartStore((s) => s.resetCart);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const isSuperAdmin = customerData?.is_super_admin === true;

  if (!customer) return null;

  const email = customer?.user_email || "";
  const displayName = customer?.user_display_name || customer?.user_nicename || email || "Account";
  const initials = (displayName?.[0] || email?.[0] || "U").toUpperCase();

  const handleLogout = async () => {
    onAfter?.();
    logout();
    resetCart();
    clearWishlist();
    localStorage.clear();
    notifyUserChanged();
    navigate("/");
  };

  return (
    <Box className="flex flex-col  w-full" sx={{ marginTop: 0, paddingTop: 0 }}>
      <Box
        className="flex items-center gap-3  border-b border-black/5"
        sx={{ marginTop: 0, paddingTop: 0 }}
      >
        <Avatar
          src={customer?.imageUrl || undefined}
          sx={{
            width: 44,
            height: 44,
            fontSize: 15,
            fontWeight: 700,
            color: "#fff",
            background: `linear-gradient(135deg, ${ACCENT} 0%, #B0335C 100%)`,
            boxShadow: `0 2px 10px ${ACCENT}40`,
          }}
        >
          {initials}
        </Avatar>
        <Box className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold text-[#0f1716] truncate">{displayName}</span>
          {email && <span className="text-[11px] text-muted-foreground truncate">{email}</span>}
        </Box>
      </Box>

      {isSuperAdmin && (
        <button
          onClick={() => {
            onAfter?.();
            navigate("/admin");
          }}
          className="flex items-center gap-3 text-[13px] font-semibold text-[#0f1716] hover:bg-black/[0.03] rounded-lg py-2 px-1.5 cursor-pointer transition-colors"
        >
          <IconChip tone="dashboard" icon={<DashboardRoundedIcon sx={{ fontSize: 17 }} />} />
          <span className="uppercase tracking-wider">Dashboard</span>
        </button>
      )}
      {isSuperAdmin && (
        <button
          onClick={() => {
            onAfter?.();
            navigate("/admin/brochure-downloads");
          }}
          className="flex items-center gap-3 text-[13px] font-semibold text-[#0f1716] hover:bg-black/[0.03] rounded-lg py-2 px-1.5 cursor-pointer transition-colors"
        >
          <IconChip tone="brochure" icon={<BookmarkRoundedIcon sx={{ fontSize: 17 }} />} />
          <span className="uppercase tracking-wider">Brochure Downloads</span>
        </button>
      )}
      <button
        onClick={() => {
          onAfter?.();
          navigate("/my-orders");
        }}
        className="flex items-center gap-3 text-[13px] font-semibold text-[#0f1716] hover:bg-black/[0.03] rounded-lg py-2 px-1.5 cursor-pointer transition-colors"
      >
        <IconChip tone="orders" icon={<ShoppingBagRoundedIcon sx={{ fontSize: 17 }} />} />
        <span className="uppercase tracking-wider">My Orders</span>
      </button>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 text-[13px] font-semibold hover:bg-black/[0.03] rounded-lg py-2 px-1.5 cursor-pointer transition-colors mt-1"
        style={{ color: MENU_ITEM_STYLES.signout.color }}
      >
        <IconChip tone="signout" icon={<LogoutRoundedIcon sx={{ fontSize: 17 }} />} />
        <span className="uppercase tracking-wider">Sign out</span>
      </button>
    </Box>
  );
}
