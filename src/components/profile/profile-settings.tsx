"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateUsername } from "@/server/actions/user";

export function ProfileSettings({ initialHandle, signOutAction }: { initialHandle: string, signOutAction: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" />}>
        <Settings className="w-5 h-5 text-white/60" />
      </DialogTrigger>
      
      <DialogContent className="bg-card border-white/10 text-white max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">Edit Profile</h4>
            <form action={async (formData) => {
              await updateUsername(formData);
              setOpen(false);
            }} className="flex space-x-2">
              <input 
                name="handle"
                defaultValue={initialHandle}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-up/50"
              />
              <Button type="submit" className="bg-white/10 hover:bg-white/20 text-white rounded-xl">
                Save
              </Button>
            </form>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">Account</h4>
            <form action={signOutAction}>
              <Button type="submit" variant="destructive" className="w-full rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
