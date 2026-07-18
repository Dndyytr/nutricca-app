import { Outlet } from "react-router-dom";
import { Sidebar, BottomNav } from "./Sidebar";
import { TopBar } from "./TopBar";

export const Layout = () => (
  <div className="flex min-h-screen bg-slate-50">
    <div className="hidden md:block w-[220px] flex-shrink-0" />
    <Sidebar />

    <div className="flex-1 flex flex-col min-w-0">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>

    <BottomNav />
  </div>
);
