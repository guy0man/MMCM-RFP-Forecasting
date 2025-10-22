import {useEffect, useState} from 'react';

// shadcn
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"


function University() {
    return (
        <div>
            <div className="flex flex-col items-center h-screen w-screen">
                <Card className="w-[60%] my-5">
                    <CardHeader>
                        University Data
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <Dialog>
                            <DialogTrigger className='w-[60%]'>
                                <Button className='w-full'>Monthly Data</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Monthly Data</DialogTitle>
                                </DialogHeader>
                                <FieldSet>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel>PHP Foreign Exchange Rate</FieldLabel>
                                            <Input type='number' placeholder='Exchange Rate'></Input>
                                        </Field>
                                        <Field>
                                            <FieldLabel>Wage Index</FieldLabel>
                                            <Input type='number' step='0.01' placeholder='wageIndex'></Input>
                                        </Field>
                                    </FieldGroup>
                                </FieldSet>

                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
                  
            </div>
        </div>
    ); 
}

export default University;