import { useEffect, useState} from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from 'react';
import { z } from "zod";

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

const schema = z.object({
    bankName: z.string().min(3, "Bank name must be at least 3 characters"),
    accountName: z.string().min(3, "Account name must be at least 3 characters"),
    accountNumber: z.string().min(3, "Account number must be at least 3 characters"),
    swiftCode: z.string().min(3,"Swift Code must be at least 3 characters"),
    contactPerson: z.string().min(3,"Contact person name must be at least 3 characters"),
    contactNumber: z.string().min(11, "Must be a valid PH contact number").max(13, "Must be a valid PH contact number").regex(/^(09\d{9}|\+639\d{9})$/, "Must be a valid PH contact number"),
    email: z.string().email("Invalid email")  
})

function BankDetails({setPage, formData,setFormData}) {
    
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        const timer = setTimeout(() => setProgress(25), 500)
        return () => clearTimeout(timer)
    }, [])

    const {
            register,
            handleSubmit,
            formState: { errors },
        } = useForm({
            resolver: zodResolver(schema),
            defaultValues: {
                // seed RHF with any existing state
                bankName: formData.bankName ?? "",
                accountName: formData.accountName ?? "",
                accountNumber: formData.accountNumber ?? "",
                swiftCode: formData.swiftCode ?? "",
                contactPerson: formData.contactPerson ?? "",
                contactNumber: formData.contactNumber ?? "",
                email: formData.email ?? "",
            },
    });

    const onValid = (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
        setPage((p) => p + 1);
    };

    const onInvalid = (errs) => {
        // optional: focus first error, toast, etc.
        console.warn("Validation errors:", errs);
    };
  
    return (
        <div class='flex flex-row justify-center items-center backdrop-blur-md bg-white/10'>
            <form onSubmit={handleSubmit(onValid, onInvalid)} class='w-[90%] max-w-6xl'>
                <Card>
                    <CardHeader>
                        <CardTitle class='text-[20px] font-bold'>Bank Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Bank Name</FieldLabel>
                                    <Input {...register("bankName")} className={errors.bankName ? "border-red-500" : ""}  placeholder="Name of Bank" />
                                    {errors.bankName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.bankName.message}</p>
                                    )}
                                </Field>
                                <Field>
                                    <FieldLabel>Account Name</FieldLabel>
                                    <Input {...register("accountName")} className={errors.accountName ? "border-red-500" : ""}  placeholder="Name on Account" />
                                    {errors.accountName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.accountName.message}</p>
                                    )}
                                </Field>
                                <Field>
                                    <FieldLabel>Account Number</FieldLabel>
                                    <Input {...register("accountNumber")} className={errors.accountNumber ? "border-red-500" : ""}  placeholder="Bank Account Number" />
                                    {errors.accountNumber && (
                                        <p className="text-red-500 text-sm mt-1">{errors.accountNumber.message}</p>
                                    )}
                                </Field>
                                <div class='grid grid-cols-2 gap-4'>
                                    <Field>
                                        <FieldLabel>Swift Code</FieldLabel>
                                        <Input {...register("swiftCode")} className={errors.swiftCode ? "border-red-500" : ""}  id="swiftCode" placeholder="Bank SWIFT Code" />
                                        {errors.swiftCode && (
                                            <p className="text-red-500 text-sm mt-1">{errors.swiftCode.message}</p>
                                        )}
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel>Contact Person</FieldLabel>
                                    <Input {...register("contactPerson")} className={errors.contactPerson ? "border-red-500" : ""}  placeholder="Bank Contact Person" />
                                    {errors.contactPerson && (
                                        <p className="text-red-500 text-sm mt-1">{errors.contactPerson.message}</p>
                                    )}
                                </Field>
                                <div class='grid grid-cols-2 gap-4'>
                                    <Field>
                                        <FieldLabel>Contact Number</FieldLabel>
                                        <Input {...register("contactNumber")} className={errors.contactNumber ? "border-red-500" : ""}  placeholder="Bank Contact Number" />
                                        {errors.contactNumber && (
                                            <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>
                                        )}
                                    </Field>
                                    <Field>
                                        <FieldLabel>Email Address</FieldLabel>
                                        <Input {...register("email")} className={errors.email ? "border-red-500" : ""}  placeholder="Bank Email Address" />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                        )}
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
                            <Button type="submit" className='w-[150px]'>
                                Next
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </form>         
        </div>
    )
}

export default BankDetails;