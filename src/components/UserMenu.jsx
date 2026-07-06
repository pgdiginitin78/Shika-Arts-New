import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/LoginServices";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export function UserMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const customer = JSON.parse(localStorage.getItem("user"));
  const resetCart = useCartStore((s) => s.resetCart);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

  const email = customer?.user_email || "";
  const displayName = customer?.user_display_name || customer?.user_nicename || "";
  const initials = (displayName?.[0] || email?.[0] || "U").toUpperCase();

  const handleLogout = async () => {
    setAnchorEl(null);
    logout();
    resetCart();
    clearWishlist();
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        aria-label={`Account menu for ${displayName}`}
        sx={{ p: 0.5 }}
      >
        <Avatar
          src={customer?.imageUrl || undefined}
          alt={displayName}
          sx={{
            width: 32,
            height: 32,
            bgcolor: "#7A1F3D",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
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
          sx: { mt: 1, minWidth: 220, borderRadius: 1.5 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {displayName}
          </Typography>
          {email && (
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              {email}
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate("/my-orders");
          }}
        >
          <ListItemIcon>
            <ShoppingBagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Orders" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate("/profilePage");
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My account" />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </MenuItem>
      </Menu>
    </>
  );
}

export function UserMenuInline({ onAfter }) {
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem("user"));
  const resetCart = useCartStore((s) => s.resetCart);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);

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
    navigate("/");
  };

  return (
    <Box className="flex flex-col gap-3 w-full">
      <Box className="flex items-center gap-3">
        <Avatar
          src={customer?.imageUrl || undefined}
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#7A1F3D",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>
        <Box className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold text-[#0f1716] truncate">{displayName}</span>
          {email && <span className="text-[11px] text-muted-foreground truncate">{email}</span>}
        </Box>
      </Box>
      <button
        onClick={() => {
          onAfter?.();
          navigate("/my-orders");
        }}
        className="flex items-center gap-3 text-[13px] uppercase tracking-wider font-semibold text-[#0f1716] hover:text-destructive py-1.5 cursor-pointer transition-colors"
      >
        <ShoppingBagIcon sx={{ fontSize: 18 }} />
        <span>My Orders</span>
      </button>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 text-[13px] uppercase tracking-wider font-semibold text-destructive py-1.5 cursor-pointer"
      >
        <LogoutIcon sx={{ fontSize: 18 }} />
        <span>Sign out</span>
      </button>
    </Box>
  );
}
