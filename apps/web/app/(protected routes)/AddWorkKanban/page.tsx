"use client"

import { AddWork } from '@/components/AddWork/AddWork'
import { KanbanBoard } from '@/components/AddWork/KanbanBoard'
import { useState } from 'react'
export default function AddWorkKanbanPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return <div className='w-full text-end p-5'>
    <h1 className='text-center mt-4 text-4xl font-semibold font-mono'>Track your work Here!</h1>
    <h1 className='text-center m-1 text-2xl font-semibold font-mono'>Manage statuse of your Works without Notbook or pen📝</h1>
    <AddWork open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
    <div className='border border-black p-4 mt-9 rounded-2xl w-full'>
    <KanbanBoard />
    </div>
   
  </div>
}