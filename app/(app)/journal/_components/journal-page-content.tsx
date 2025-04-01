"use client"

import { motion, Variants } from "framer-motion"
import NotesTab from "./notes-tab"
import ChatTab from "./chat-tab"

interface JournalPageContentProps {
  userId: string
  activeTab: "notes" | "chat"
  custom: number
  variants: Variants
}

export default function JournalPageContent({ 
  userId, 
  activeTab, 
  custom,
  variants 
}: JournalPageContentProps) {
  return (
    <motion.div
      className="h-full"
      key={activeTab}
      custom={custom}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
    >
      {activeTab === "notes" && <NotesTab userId={userId} />}
      {activeTab === "chat" && <ChatTab userId={userId} />}
    </motion.div>
  )
} 