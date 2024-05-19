"use client";
import React from "react";
import SortIcon from "@mui/icons-material/Sort";
import { ExpandLess, ExpandMore, Search } from "@mui/icons-material";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import {
  Box,
  Collapse,
  Fade,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
const SortSideBar = ({ sortByDate, sortByBalance }) => {
  const sortHandle = () => setOpenSort(!openSort);
  const [openSort, setOpenSort] = React.useState(false);

  return (
    <div
      style={{
        backgroundColor: "black",
        width: "20%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeftWidth: "1px",
        borderLeftStyle: "solid",
        borderLeftColor: "rgba(255,255, 255, 0.5)",
        color: "white",
      }}
    >
      <div>
        <ListItemButton onClick={sortHandle}>
          <ListItemIcon>
            <SortIcon htmlColor="#30ceb7" />
          </ListItemIcon>
          <ListItemText primary="Sort By" />
          {!openSort ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSort} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton onClick={() => sortByDate()} sx={{ pl: 4 }}>
              <ListItemIcon>
                <DateRangeIcon htmlColor="#30ceb7" />
              </ListItemIcon>
              <ListItemText primary="By Date" />
            </ListItemButton>
            <ListItemButton onClick={() => sortByBalance()} sx={{ pl: 4 }}>
              <ListItemIcon>
                <AccountBalanceWalletIcon htmlColor="#30ceb7" />
              </ListItemIcon>
              <ListItemText primary="By Boost" />
            </ListItemButton>
          </List>
        </Collapse>
      </div>
    </div>
  );
};

export default SortSideBar;
