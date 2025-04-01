"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, MessageSquare } from "lucide-react"
import JournalPageContent from "./_components/journal-page-content"
import PageSkeleton from "./_components/page-skeleton"
import { motion, AnimatePresence, PanInfo } from "framer-motion"

export default function JournalPage() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"notes" | "chat">("notes")

  const swipeThreshold = 50
  const swipeVelocityThreshold = 0.3

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const swipeDistance = offset.x
    const swipeVelocity = velocity.x

    // Log the raw data and calculated values
    console.log("Swipe End:", { offset, velocity, swipeDistance, swipeVelocity });

    // Swipe Left (Next tab - Chat)
    if (swipeDistance < -swipeThreshold && swipeVelocity < -swipeVelocityThreshold) {
      console.log("Swipe Left Detected - Switching to Chat");
      setActiveTab("chat")
    // Swipe Right (Previous tab - Notes)
    } else if (swipeDistance > swipeThreshold && swipeVelocity > swipeVelocityThreshold) {
      console.log("Swipe Right Detected - Switching to Notes");
      setActiveTab("notes")
    } else {
      // Log if conditions are not met
      console.log("Swipe conditions not met:", {
        isDistanceLeftMet: swipeDistance < -swipeThreshold,
        isVelocityLeftMet: swipeVelocity < -swipeVelocityThreshold,
        isDistanceRightMet: swipeDistance > swipeThreshold,
        isVelocityRightMet: swipeVelocity > swipeVelocityThreshold
      });
    }
  }

  if (!isLoaded) {
    return <PageSkeleton />
  }

  if (!userId) {
    router.push("/login")
    return null
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0
    })
  }

  const direction = activeTab === "notes" ? -1 : 1

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      <Tabs 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "notes" | "chat")}
        className="flex flex-col h-full flex-1"
      >
        <div className="sticky top-0 z-30 bg-background pt-4 px-4 md:px-6 border-b flex-none">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Notes</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <motion.div 
          className="flex-1 relative overflow-hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDragEnd={handleDragEnd}
          style={{ touchAction: "pan-x" }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <JournalPageContent 
              key={activeTab}
              userId={userId} 
              activeTab={activeTab} 
              custom={direction}
              variants={variants}
            />
          </AnimatePresence>
        </motion.div>
      </Tabs>
    </div>
  )
} 