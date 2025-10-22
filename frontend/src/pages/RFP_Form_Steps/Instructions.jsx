import {use, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import React from 'react';
import api from "../../api";
import { ChevronDownIcon } from "lucide-react"

//shadcn
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

function Instructions({setPage, formData,setFormData}) {
    
    const [progress, setProgress] = React.useState(50)
    
    React.useEffect(() => {
        const timer = setTimeout(() => setProgress(75), 500)
        return () => clearTimeout(timer)
    }, [])
  
    return (
        <div class='flex flex-row justify-center items-center backdrop-blur-md bg-white/10'>
            <div class='w-[90%] max-w-6xl'>
                <Card>
                    <CardHeader>
                        <CardTitle class='text-[20px] font-bold'>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                            <FieldGroup>
                                <Field>
                                    <Textarea classname='min-h-[200px]' placeholder="Enter instructions" value={formData.instruction} onChange={(event) => setFormData({...formData, instruction: event.target.value})}/>
                                </Field>
                            </FieldGroup>
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
                                Next
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>         
        </div>
    )
}

export default Instructions;