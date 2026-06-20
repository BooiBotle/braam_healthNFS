import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { S } from "./shared";

export default function Layout() {
  return (
    <div style={S.shell}>
      <Sidebar />
      <div style={S.page}>
        <Outlet />
      </div>
    </div>
  );
}
