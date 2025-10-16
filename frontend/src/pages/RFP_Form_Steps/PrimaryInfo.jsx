import {useEffect, useState} from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../api";
import { ChevronDownIcon } from "lucide-react"
import { z } from "zod";

//shadcn
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Field,
  FieldGroup,
  FieldLabel,
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
  CardContent,
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

const today = new Date();
today.setHours(0, 0, 0, 0);

const schema = z.object({
    requestedBy: z.string().min(3, "Requester must be at least 3 characters"),
    department: z.coerce.number().min(1),
    payableTo: z.string().min(3,"payee must be at least 3 characters"),
    description: z.string().nonempty("Description is required"),
    sourceOfFund: z.coerce.number().min(1),
    dateNeeded: z.date({ required_error: "Date is required" }).refine(d => {
        const t = new Date(); t.setHours(0,0,0,0);
        const dd = new Date(d); dd.setHours(0,0,0,0);
        return dd >= t;
    }, "Date must be today or later"),
    transactionType: z.coerce.number().min(1)
})

function PrimaryInfo({setPage,formData,setFormData}) {

    //lists
    const [departments,setDepartments] = useState([]);
    const [sourcesOfFunds, setSourcesOfFunds] = useState([]);
    const [transactionTypes,setTransactionTypes] = useState([]);  
    const dateObj = formData.dateNeeded ? new Date(formData.dateNeeded) : undefined; 

    const [open,setOpen] = useState(false);
    
    const initialDate =
    typeof formData.dateNeeded === "string" && formData.dateNeeded
      ? new Date(formData.dateNeeded.replace(/-/g, "/")) // safer parse for "YYYY-MM-DD"
      : formData.dateNeeded instanceof Date
      ? formData.dateNeeded
      : undefined;

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            // seed RHF with any existing state
            requestedBy: formData.requestedBy ?? "",
            department: formData.department ?? "",
            payableTo: formData.payableTo ?? "",
            description: formData.description ?? "",
            sourceOfFund: formData.sourceOfFund ?? "",
            dateNeeded: initialDate ?? undefined,
            transactionType: formData.transactionType ?? "",
        },
    });

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

    const onValid = (data) => {
        const fmt = (d) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                d.getDate()
            ).padStart(2, "0")}`;

        setFormData((prev) => ({
            ...prev,
            ...data,
            // store string for API or parent if you prefer:
            dateNeeded: fmt(data.dateNeeded),
        }));
        setPage((p) => p + 1);
    };

    const onInvalid = (errs) => {
        // optional: focus first error, toast, etc.
        console.warn("Validation errors:", errs);
    };
    
    
    return (
        <div class='flex flex-row justify-center backdrop-blur-md bg-white/10'>
            <form onSubmit={handleSubmit(onValid, onInvalid)} class='space-y-3 w-[90%] max-w-6xl'>
                <Card>
                    <CardHeader>
                        <CardTitle class='text-[20px] font-bold'>Request Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Requested By</FieldLabel>
                                <Input
                                    {...register("requestedBy")} 
                                    id="requestedBy" 
                                    placeholder="Name of Requestor" 
                                    className={errors.requestedBy ? "border-red-500" : ""}
                                />
                                {errors.requestedBy && (
                                    <p className="text-red-500 text-sm mt-1">{errors.requestedBy.message}</p>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel>Department</FieldLabel>
                                <Controller
                                    name="department"
                                    control={control}
                                    render={({ field }) => (
                                    <Select
                                        value={String(field.value ?? "")}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className={`w-[180px] ${errors.department ? "border-red-500" : ""}`}>
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
                                    )}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Payable To</FieldLabel>
                                <Input 
                                    {...register("payableTo")} 
                                    id="payableTo" 
                                    placeholder="Name of Payee" 
                                    className={errors.payableTo ? "border-red-500" : ""}
                                />
                                {errors.payableTo && (
                                    <p className="text-red-500 text-sm mt-1">{errors.payableTo.message}</p>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                    {...register("description")}  
                                    id="description" 
                                    placeholder="Brief Description of Payment" 
                                    className={errors.description ? "border-red-500" : ""}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </Field>
                            <div class='grid grid-cols-2 gap-4'>
                                <Field>
                                    <FieldLabel>Source of Fund</FieldLabel>
                                    <Controller
                                        name="sourceOfFund"
                                        control={control}
                                        render={({ field }) => (
                                        <Select
                                            value={String(field.value ?? "")}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className={errors.sourceOfFund ? "border-red-500" : ""}>
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
                                        )}
                                    />
                                </Field>  
                                <Field>
                                    <FieldLabel>Date Needed</FieldLabel>
                                    <Controller
                                        name="dateNeeded"
                                        control={control}
                                        render={({ field }) => {
                                        const dateObj = field.value ?? undefined; // Date | undefined
                                        return (
                                            <>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    id="dateNeeded"
                                                    className={`w-48 justify-between font-normal ${
                                                    errors.dateNeeded ? "border-red-500" : ""
                                                    }`}
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
                                                    fromDate={today}  
                                                    disabled={(date) => date < today}              
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const dd = new Date(date);
                                                        dd.setHours(0, 0, 0, 0);
                                                        if (dd < today) return;
                                                        field.onChange(dd);           
                                                        setOpen(false);
                                                    }}
                                                />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.dateNeeded && (
                                                <p className="text-red-500 text-sm mt-1">{errors.dateNeeded.message}</p>
                                            )}
                                            </>
                                        );
                                        }}
                                    />
                                    </Field> 
                                <Field>
                                    <FieldLabel>Transaction Type</FieldLabel>
                                    <Controller
                                        name="transactionType"
                                        control={control}
                                        render={({ field }) => (
                                        <Select
                                            value={String(field.value ?? "")}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className={errors.transactionType ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select Transaction Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                            {transactionTypes.map((t) => (
                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.name}
                                                </SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        )}
                                    />
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

export default PrimaryInfo;