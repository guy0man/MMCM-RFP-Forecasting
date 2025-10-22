import {use, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import React from 'react';
import api from "../../api";
import { ChevronDownIcon } from "lucide-react"

//shadcn
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function ConfirmDetails({setPage, formData,setFormData}) {

    const [progress, setProgress] = React.useState(75)
        
    React.useEffect(() => {
        const timer = setTimeout(() => setProgress(100), 500)
        return () => clearTimeout(timer)
    }, [])
  
    return (
        <div class='flex flex-row justify-center items-center backdrop-blur-md bg-white/10'>
            <div class='w-[90%] max-w-6xl'>
                <Card>
                    <CardHeader>
                        <CardTitle class='text-[20px] font-bold'>Confirm Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <ScrollArea className="h-64"> {/* set the scrollable height */}
                            <div className="pr-4 space-y-2">
                            {Object.entries(formData).map(([key, value]) => (
                                <div key={key} className="flex items-start justify-between gap-4 border-b border-border/50 py-2">
                                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-sm font-medium break-words text-right">
                                    {value == null || value === "" ? "—" : String(value)}
                                </span>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter class="flex flex-col items-center gap-5 mt-5">
                        <Progress value={progress} className='w-[60%]'/>          
                        <div class='flex gap-10'>
                            <Button 
                                variant='secondary' 
                                className='w-[150px]'
                                onClick={() => {
                                    setPage((currPage) => currPage - 1)
                                }}
                            >
                                Previous
                            </Button>
                            <Button className='w-[150px]'
                                onClick={() => {
                                    setPage((currPage) => currPage + 1)
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>         
        </div>
    )
}

export default ConfirmDetails;