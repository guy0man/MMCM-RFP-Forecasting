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
import { Input } from "@/components/ui/input"
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

function BankDetails({setPage, formData,setFormData}) {
    
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        const timer = setTimeout(() => setProgress(25), 500)
        return () => clearTimeout(timer)
    }, [])
  
    return (
        <div class='flex flex-row justify-center items-center backdrop-blur-md bg-white/10'>
            <div class='w-[90%] max-w-6xl'>
                <Card>
                    <CardHeader>
                        <CardTitle class='text-[20px] font-bold'>Bank Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Bank Name</FieldLabel>
                                    <Input placeholder="Name of Bank" value={formData.bankName} onChange={(event) => setFormData({...formData, bankName: event.target.value})}/>
                                </Field>
                                <Field>
                                    <FieldLabel>Account Name</FieldLabel>
                                    <Input placeholder="Name on Account" value={formData.accountName} onChange={(event) => setFormData({...formData, accountName: event.target.value})}/>
                                </Field>
                                <Field>
                                    <FieldLabel>Account Number</FieldLabel>
                                    <Input placeholder="Bank Account Number" value={formData.accountNumber} onChange={(event) => setFormData({...formData, accountNumber: event.target.value})}/>
                                </Field>
                                <div class='grid grid-cols-2 gap-4'>
                                    <Field>
                                        <FieldLabel>Swift Code</FieldLabel>
                                        <Input id="swiftCode" placeholder="Bank SWIFT Code" value={formData.swiftCode} onChange={(event) => setFormData({...formData, swiftCode: event.target.value})}/>
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel>Contact Person</FieldLabel>
                                    <Input placeholder="Bank Contact Person" value={formData.contactPerson} onChange={(event) => setFormData({...formData, contactPerson: event.target.value})}/>
                                </Field>
                                <div class='grid grid-cols-2 gap-4'>
                                    <Field>
                                        <FieldLabel>Contact Number</FieldLabel>
                                        <Input placeholder="Bank Contact Number" value={formData.contactNumber} onChange={(event) => setFormData({...formData, contactNumber: event.target.value})}/>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Email Address</FieldLabel>
                                        <Input placeholder="Bank Email Address" value={formData.email} onChange={(event) => setFormData({...formData, email: event.target.value})}/>
                                    </Field>
                                </div>
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

export default BankDetails;