import { useState } from "react";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import { customerLogout } from "@/lib/shopifyCustomerAuth";
// import { initiateLogout } from "@/lib/shopifyAuth";

/**
 * Compact avatar + dropdown for the signed-in user. Used in the desktop
 * header. Mobile menu uses the inline variant below.
 */
export function UserMenu() {
  const customer = useCustomerAuthStore((s) => s.customer);
  const idToken = useCustomerAuthStore((s) => s.idToken);
  const logout = useCustomerAuthStore((s) => s.logout);
  const [anchorEl, setAnchorEl] = useState(null);

  if (!customer) return null;

  const firstName = customer.firstName || "";
  const lastName = customer.lastName || "";
  const email = customer.emailAddress?.emailAddress || "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || email || "Account";
  const initials =
    (firstName?.[0] || email?.[0] || "U").toUpperCase() + (lastName?.[0] || "").toUpperCase();

  const handleLogout = async () => {
    setAnchorEl(null);
    const token = useCustomerAuthStore.getState().token;
    logout();
    try {
      if (token) await customerLogout(token);
    // await initiateLogout(idToken);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      window.location.href = "/";
    }
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
          src={customer.imageUrl || undefined}
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
        <MenuItem disabled>
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

/**
 * Inline name + sign-out for the mobile drawer.
 */
export function UserMenuInline({ onAfter }) {
  const customer = useCustomerAuthStore((s) => s.customer);
  const idToken = useCustomerAuthStore((s) => s.idToken);
  const logout = useCustomerAuthStore((s) => s.logout);

  if (!customer) return null;

  const firstName = customer.firstName || "";
  const lastName = customer.lastName || "";
  const email = customer.emailAddress?.emailAddress || "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || email || "Account";
  const initials =
    (firstName?.[0] || email?.[0] || "U").toUpperCase() + (lastName?.[0] || "").toUpperCase();

  const handleLogout = async () => {
    onAfter?.();
    const token = useCustomerAuthStore.getState().token;
    logout();
    try {
      if (token) await customerLogout(token);
    // await initiateLogout(idToken);
    } catch {
      // non-fatal
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <Box className="flex flex-col gap-3 w-full">
      <Box className="flex items-center gap-3">
        <Avatar
          src={customer.imageUrl || undefined}
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
        onClick={handleLogout}
        className="flex items-center gap-3 text-[13px] uppercase tracking-wider font-semibold text-destructive py-1.5 cursor-pointer"
      >
        <LogoutIcon sx={{ fontSize: 18 }} />
        <span>Sign out</span>
      </button>
    </Box>
  );
}
