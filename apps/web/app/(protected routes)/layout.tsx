"use client";

import Link from "next/link";
import { format } from "date-fns";
import "@workspace/ui/globals.css";
import { Providers } from "@/components/providers";
import { logoutUser } from "@/lib/api";

import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@workspace/ui/components/sidebar";
import { Button } from "@workspace/ui/components/button";

const logout = async () => {
  try {
    await logoutUser();
    window.location.href = "/";
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Failed to logout");
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Work Navigatin</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="flex flex-col gap-2 p-3 font-semibold">
            <Link href="/AddWorkKanban">Add Work</Link>
            <Link href="/Dash">Dashboard</Link>
          </SidebarContent>

          <Button
            className="bg-white hover:bg-gray-100"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
        </Sidebar>
        <main className="flex-1 w-full bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  {format(new Date(), "EEE MMM dd h:mm a")}
                </div>
              </div>
              <SidebarTrigger className="text-gray-600 hover:text-black" />
            </div>
          </div>
          <div className="p-4">{children}</div>
        </main>
      </SidebarProvider>
    </Providers>
  );
}
