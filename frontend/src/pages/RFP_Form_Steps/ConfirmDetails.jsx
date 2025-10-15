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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
                    <CardContent>
                        <Table>
                            <TableBody></TableBody>
                        </Table>                 
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

export default ConfirmDetails;