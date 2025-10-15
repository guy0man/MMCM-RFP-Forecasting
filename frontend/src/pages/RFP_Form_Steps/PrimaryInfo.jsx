import {use, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import React from 'react';
import api from "../../api";
import { ChevronDownIcon } from "lucide-react"

//shadcn
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"

function PrimaryInfo({setPage,formData,setFormData}) {

    //lists
    const [departments,setDepartments] = useState([]);
    const [sourcesOfFunds, setSourcesOfFunds] = useState([]);
    const [transactionTypes,setTransactionTypes] = useState([]);  
    const dateObj = formData.dateNeeded ? new Date(formData.dateNeeded) : undefined; 

    const [open,setOpen] = useState(false);  

    useEffect(() => {
        getDepartments();
        getSourcesOfFunds();
        getTransactionType();
    }, []);

    const getDepartments = () => {
        api.get("/api/departments/")
        .then((res) => res.data)
        .then((data) => {setDepartments(data); console.log(data) })
        .catch((err) => alert(err));
    };

    const getSourcesOfFunds = () => {
        api.get("/api/source-of-funds/")
        .then((res) => res.data)
        .then((data) => {setSourcesOfFunds(data); console.log(data) })
        .catch((err) => alert(err));
    };

    const getTransactionType = () => {
        api.get("/api/transaction-types/")
        .then((res) => res.data)
        .then((data) => {setTransactionTypes(data); console.log(data) })
        .catch((err) => alert(err));
    };
    
    
    return (
        <div class='flex flex-row justify-center backdrop-blur-md bg-white/10'>
            <div class='space-y-3 w-[90%] max-w-6xl'>
                <Card>
                    <CardHeader>
                        <CardTitle class='text-[20px] font-bold'>Request Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Requested By</FieldLabel>
                                <Input 
                                    id="requestedBy" 
                                    placeholder="Name of Requestor" 
                                    value={formData.requestedBy ?? ""} 
                                    onChange={(event) => 
                                        setFormData({...formData, requestedBy: event.target.value})
                                    }
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Department</FieldLabel>
                                <Select
                                    value={formData.department ?? ""}
                                    onValueChange={(value) =>
                                        setFormData({...formData, department: value})
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel>Payable To</FieldLabel>
                                <Input 
                                    id="payableTo" 
                                    placeholder="Name of Payee" 
                                    value={formData.payableTo ?? ""} 
                                    onChange={(event) => 
                                    setFormData({...formData, payableTo: event.target.value})
                                    }
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea 
                                    id="description" 
                                    placeholder="Brief Description of Payment" 
                                    value={formData.description ?? ""} 
                                    onChange={(event) => 
                                        setFormData({...formData, description: event.target.value})
                                    }
                                />
                            </Field>
                            <div class='grid grid-cols-2 gap-4'>
                                <Field>
                                    <FieldLabel>Source of Fund</FieldLabel>
                                    <Select 
                                        value={formData.sourceOfFund ?? ""}
                                        onValueChange={(value) =>
                                            setFormData({...formData, sourceOfFund: value})
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Source of Fund" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sourcesOfFunds.map((sof) => (
                                                <SelectItem key={sof.id} value={sof.id.toString()}>
                                                    {sof.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>  
                                <Field>
                                    <FieldLabel>Date Needed</FieldLabel>
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                id="dateNeeded"
                                                className="w-48 justify-between font-normal"
                                            >
                                                {dateObj ? dateObj.toLocaleDateString() : "Select date"}
                                                <ChevronDownIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateObj}
                                                captionLayout="dropdown"
                                                onSelect={(date) => {
                                                    setFormData({...formData, dateNeeded: date ? date.toISOString().split("T")[0] : ""})
                                                    setOpen(false)
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </Field>  
                                <Field>
                                    <FieldLabel>Transaction Type</FieldLabel>
                                    <Select 
                                        value={formData.transactionType ?? ""}
                                        onValueChange={(value) =>
                                            setFormData({...formData, transactionType: value})
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Transaction Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transactionTypes.map((trans) => (
                                                <SelectItem key={trans.id} value={trans.id.toString()}>
                                                    {trans.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>                                                                
                            </div>
                        </FieldGroup>            
                    </CardContent>
                    <CardFooter class="flex flex-col items-center gap-5 mt-5">
                        <Progress value={0} className='w-[60%]'/>          
                        <div class='flex gap-10'>
                            <Button 
                                variant='secondary' 
                                className='w-[150px]'
                                onClick={() => {
                                    setPage((currPage) => currPage - 1)
                                }}
                            >
                                Cancel
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

export default PrimaryInfo;