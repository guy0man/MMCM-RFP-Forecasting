import {useEffect, useState} from 'react';
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function Request_Form() {

    const [requestedBy, setRequestedBy] = useState('');
    const [department, setDepartment] = useState('');
    const [payableTo, setPayableTo] = useState('');
    const [description, setDescription] = useState('');
    const [sourceOfFund, setSourceOfFund] = useState('');
    const [dateNeeded, setDateNeeded] = useState('');
    const [transactionType, setTransactionType] = useState('');
    // bank details
    const [bankName, setBankName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [swiftCode, setSwiftCode] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    //payment schedule
    const [modeOfPayment, setModeOfPayment] = useState('');
    const [termsOfPayment, setTermsOfPayment] = useState('');
    const [pr,setPr] = useState('');
    const [po, setPo] = useState('');
    const [rr, setRr] = useState('');
    //payee information
    const [tin, setTin] = useState('');
    const [payeeAddress, setPayeeAddress] = useState('');
    //payment details
    const [taxRegistration, setTaxRegistration] = useState('');
    const [typeOfBusiness, setTypeOfBusiness] = useState('');
    const [currency, setCurrency] = useState('');
    const [amount, setAmount] = useState(0);
    const [serviceFee, setServiceFee] = useState(0);
    const [lessEWT, setLessEWT] = useState(0);
    //instructions
    const [instructions, setInstructions] = useState('');
    //lists
    const [departments,setDepartments] = useState([]);
    const [sourcesOfFunds, setSourcesOfFunds] = useState([]);
    const [transactionTypes,setTransactionTypes] = useState([]);   
    const [modesOfPayments,setModesOfPayments] = useState([]);
    const [taxRegistrations, setTaxRegistrations] = useState([]);
    const [typesOfBusiness, setTypesOfBusiness]= useState([]);
    //others
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
    } 

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
        <div class='flex flex-row justify-center w-screen backdrop-blur-md bg-white/10 p-6'>
            <form class='space-y-3 w-[90%] max-w-6xl'>
                <Card>
                    <CardHeader>
                        <CardTitle>Request For Payment Form</CardTitle>
                        <CardDescription>Use this form to request payment for approved expenses, purchases, or reimbursements. Each request is reviewed by the finance office and automatically included in the university’s financial forecast.</CardDescription>
                    </CardHeader>
                    <CardContent>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>Requested By</FieldLabel>
                                        <Input id="requestedBy" placeholder="Name of Requestor" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)}/>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Department</FieldLabel>
                                        <Select onValueChange={setDepartment} defaultValue="">
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
                                        <Input id="payableTo" placeholder="Name of Payee" value={payableTo} onChange={(e) => setPayableTo(e.target.value)}/>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea id="description" placeholder="Brief Description of Payment" value={description} onChange={(e) => setDescription(e.target.value)}/>
                                    </Field>
                                    <div class='grid grid-cols-2 gap-4'>
                                        <Field>
                                            <FieldLabel>Source of Fund</FieldLabel>
                                            <Select onValueChange={setSourceOfFund} defaultValue="">
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
                                                    {dateNeeded ? dateNeeded.toLocaleDateString() : "Select date"}
                                                    <ChevronDownIcon />
                                                </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateNeeded}
                                                    captionLayout="dropdown"
                                                    onSelect={(dateNeeded) => {
                                                    setDateNeeded(dateNeeded)
                                                    setOpen(false)
                                                    }}
                                                />
                                                </PopoverContent>
                                            </Popover>
                                        </Field>  
                                        <Field>
                                            <FieldLabel>Transaction Type</FieldLabel>
                                            <Select onValueChange={setTransactionType} defaultValue="">
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
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Bank Name</FieldLabel>
                                    <Input id="bankName" placeholder="Name of Bank" value={bankName} onChange={(e) => setBankName(e.target.value)}/>
                                </Field>
                                <Field>
                                    <FieldLabel>Account Name</FieldLabel>
                                    <Input id="accountName" placeholder="Name on Account" value={accountName} onChange={(e) => setAccountName(e.target.value)}/>
                                </Field>
                                <Field>
                                    <FieldLabel>Account Number</FieldLabel>
                                    <Input id="accountNumber" placeholder="Bank Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}/>
                                </Field>
                                <div class='grid grid-cols-2 gap-4'>
                                    <Field>
                                        <FieldLabel>SWIFT Code</FieldLabel>
                                        <Input id="swiftCode" placeholder="Bank SWIFT Code" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)}/>
                                    </Field>
                                </div>
                                <Field>
                                    <FieldLabel>Contact Person</FieldLabel>
                                    <Input id="contactPerson" placeholder="Bank Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}/>
                                </Field>
                                <div class='grid grid-cols-2 gap-4'>
                                    <Field>
                                        <FieldLabel>Contact Number</FieldLabel>
                                        <Input id="contactNumber" placeholder="Bank Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}/>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Email Address</FieldLabel>
                                        <Input id="emailAddress" placeholder="Bank Email Address" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)}/>
                                    </Field>
                                </div>
                            </FieldGroup>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldSet>
                                                    
                        </FieldSet>
                    </CardContent>
                </Card>
            </form>
        </div>
    ); 
}

export default Request_Form;