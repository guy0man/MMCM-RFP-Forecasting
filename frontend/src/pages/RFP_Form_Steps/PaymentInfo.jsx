import { useEffect, useState} from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from 'react';
import api from "../../api";

//shadcn
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
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
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const schema = z.object({
  modeOfPayment: z.coerce.number().min(1),
  tin: z.string().regex(/^\d{3}-?\d{3}-?\d{3}-?\d{0,3}$/, "Invalid TIN format"),
  payeeAddress: z.string().min(1,"Address is required"),
  pr: z.string().min(1),
  po: z.string().min(1),
  rr: z.string().min(1),
  taxRegistration: z.string().min(1,"Address is required"),
  typeOfBusiness: z.string().min(1,"Address is required"),
  currency:z.string().min(1,"Currency is required"),
  amount: z.coerce
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0"),
  serviceFee: z.union([
      z.literal(""), 
      z.coerce.number().positive("Service fee must be greater than 0")
    ])
    .optional(),
  lessEWT: z.union([
    z.literal(""), 
    z.coerce.number().positive("Less must be greater than 0")
  ])
  .optional(),
  netTotal:  z.coerce
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Net Total must be greater than 0"),

})

function PaymentInfo({setPage,formData,setFormData}) {
  const [modesOfPayment,setModesOfPayment] = useState([]);  
  const [taxRegistrations,setTaxRegistrations] = useState([]);  
  const [typesOfBusinesses,setTypesOfBusinesses] = useState([]);  
  const [progress, setProgress] = React.useState(25)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    } = useForm({
      resolver: zodResolver(schema),
      defaultValues: {
        // seed RHF with any existing state
        modeOfPayment: formData.modeOfPayment ?? "",
        tin: formData.tin ?? "",
        payeeAddress: formData.payeeAddress ?? "",
        termsOfPayment: formData.termsOfPayment ?? "",
        pr: formData.pr ?? "",
        po: formData.po ?? "",
        rr: formData.rr ?? "",
        taxRegistration: formData.taxRegistration ?? "",
        typeOfBusiness: formData.typeOfBusiness ?? "",
        currency: formData.currency ?? "",
        amount: formData.amount ?? "",
        serviceFee: formData.serviceFee ?? "",
        lessEWT: formData.lessEWT ?? "",
        netTotal: formData.netTotal ?? "",
      },
  });

  const [amount, serviceFee, lessEWT] = watch([
    "amount",
    "serviceFee",
    "lessEWT",
  ]);

  useEffect(() => {
    getModesOfPayment()
    getTypesOfBusinesses()
    getTaxRegistrations()
    const net = toNum(amount) - toNum(lessEWT) - toNum(serviceFee);
    setValue("netTotal", net, { shouldValidate: true, shouldDirty: true });
  }, [amount, serviceFee, lessEWT, setValue])

  const getModesOfPayment = () => {
    api.get("/api/modes-of-payment/")
    .then((res) => res.data)
    .then((data) => {setModesOfPayment(data); console.log(data) })
    .catch((err) => alert(err));
  };

  const getTypesOfBusinesses = () => {
    api.get("/api/types-of-business/")
    .then((res) => res.data)
    .then((data) => {setTypesOfBusinesses(data); console.log(data) })
    .catch((err) => alert(err));
  };

  const getTaxRegistrations = () => {
  api.get("/api/tax-registrations/")      // adjust to your endpoint
    .then(res => res.data)
    .then(setTaxRegistrations)
    .catch(err => alert(err));
  };

  const toNum = (v) => {
    const n = parseFloat(String(v ?? "").replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const netTotalVal = watch("netTotal");

  const onValid = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setPage((p) => p + 1);
  };

  const onInvalid = (errs) => {
    // optional: focus first error, toast, etc.
    console.warn("Validation errors:", errs);
  };

  return (
    <div class='flex flex-row justify-center backdrop-blur-md bg-white/10'>
      <form onSubmit={handleSubmit(onValid, onInvalid)} class='w-[90%] max-w-6xl'>
        <Card>
          <CardHeader>
            <CardTitle class='text-[20px] font-bold'>Payment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <div class='grid grid-cols-2 gap-4'>
              <Field>
                <FieldLabel>Mode Of Payment</FieldLabel>
                  <Controller
                    name="modeOfPayment"
                    control={control}
                    render={({field}) => (
                      <Select
                        value={String(field.value ?? "")}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={`w-[180px] ${errors.modeOfPayment ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select Mode of Payment" />
                        </SelectTrigger>
                        <SelectContent>
                          {modesOfPayment.map((mop) => (
                            <SelectItem key={mop.id} value={mop.id.toString()}>
                              {mop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel>TIN</FieldLabel>
                  <Input {...register("tin")} className={errors.tin ? "border-red-500" : ""} placeholder="TIN Number"/>
                </Field>
              </div> 
              <Field>
                  <FieldLabel>Payee Address</FieldLabel>
                  <Input {...register("payeeAddress")} className={errors.payeeAddress ? "border-red-500" : ""} placeholder="Address of the Payee"/>
              </Field>  
              <Field>
                <FieldLabel>Terms of Payment</FieldLabel>
                <Textarea placeholder="Terms of Payment"/>
              </Field>  
              <div class='grid grid-cols-2 gap-4'>
                <div class='flex flex-col gap-4'>
                  <Field>
                    <FieldLabel>PR</FieldLabel>
                    <Input {...register("pr")} className={errors.pr ? "border-red-500" : ""} placeholder="PR"/>
                  </Field>
                  <Field>
                    <FieldLabel>PO</FieldLabel>
                    <Input {...register("po")} className={errors.po? "border-red-500" : ""} placeholder="PO"/>
                  </Field>
                  <Field>
                    <FieldLabel>RR</FieldLabel>
                    <Input {...register("rr")} className={errors.rr ? "border-red-500" : ""} placeholder="RR"/>
                  </Field> 
                </div>  
                <div class='flex flex-col gap-4'>
                  <Field>
                    <FieldLabel>Tax Registration</FieldLabel>
                    <Controller
                      name="taxRegistration"
                      control={control}
                      render={({field}) => (
                        <Select
                          value={String(field.value ?? "")}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className={`w-[180px] ${errors.taxRegistration? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Select Tax Registration" />
                          </SelectTrigger>
                          <SelectContent>
                            {taxRegistrations.map((tax) => (
                              <SelectItem key={tax.id} value={tax.id.toString()}>
                                {tax.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Type of Business</FieldLabel>
                    <Controller
                      name="typeOfBusiness"
                      control={control}
                      render={({field}) => (
                        <Select
                          value={String(field.value ?? "")}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className={`w-[180px] ${errors.typeOfBusiness ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Select Type of Business" />
                          </SelectTrigger>
                          <SelectContent>
                            {typesOfBusinesses.map((tob) => (
                              <SelectItem key={tob.id} value={tob.id.toString()}>
                                {tob.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Currency</FieldLabel>
                    <Input {...register("currency")} className={errors.currency ? "border-red-500" : ""} placeholder="Choose a Currency" />
                  </Field> 
                  <Field>
                    <FieldLabel>Amount</FieldLabel>
                    <Input {...register("amount")} className={errors.amount ? "border-red-500" : ""} placeholder="Enter Amount" inputMode='decimal' />
                    {errors.amount && (
                      <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                    )}
                  </Field> 
                  <Field>
                    <FieldLabel>Service Fee</FieldLabel>
                    <Input {...register("serviceFee")} className={errors.serviceFee ? "border-red-500" : ""} placeholder="Enter Service Fee" inputMode='decimal'/>
                    {errors.serviceFee && (
                      <p className="text-red-500 text-sm mt-1">{errors.serviceFee.message}</p>
                    )}
                  </Field> 
                  <Field>
                    <FieldLabel>Less: EWT</FieldLabel>
                    <Input {...register("lessEWT")} className={errors.lessEWT ? "border-red-500" : ""} placeholder="Enter Withholding Tax" inputMode='decimal'/>
                    {errors.lessEWT && (
                      <p className="text-red-500 text-sm mt-1">{errors.lessEWT.message}</p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Net Total Amount</FieldLabel>
                    <Input 
                      {...register("netTotal")}
                      readOnly
                      className={`focus:ring-0 ${Number(netTotalVal) < 0 ? "text-red-600" : ""} ${errors.netTotal ? "border-red-500" : ""}`}
                      value={
                        Number.isFinite(Number(netTotalVal))
                          ? Number(netTotalVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ""
                      }
                    />
                    {errors.netTotal && (
                      <p className="text-red-500 text-sm mt-1">{errors.netTotal.message}</p>
                    )}
                  </Field>
                </div>         
              </div>                          
            </FieldSet>
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

export default PaymentInfo;