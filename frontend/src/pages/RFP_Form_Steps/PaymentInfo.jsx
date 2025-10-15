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
import { Progress } from "@/components/ui/progress"

function PaymentInfo({setPage,formData,setFormData}) {
  const [modesOfPayment,setModesOfPayment] = useState([]);  
  const [taxRegistrations,setTaxRegistrations] = useState([]);  
  const [typesOfBusinesses,setTypesOfBusinesses] = useState([]);  
  const [progress, setProgress] = React.useState(25)
  
  React.useEffect(() => {
      const timer = setTimeout(() => setProgress(50), 500)
      return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    getModesOfPayment()
    getTypesOfBusinesses()
  }, []);

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

  return (
    <div class='flex flex-row justify-center backdrop-blur-md bg-white/10'>
      <div class='w-[90%] max-w-6xl'>
        <Card>
          <CardHeader>
            <CardTitle class='text-[20px] font-bold'>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <div class='grid grid-cols-2 gap-4'>
              <Field>
                <FieldLabel>Mode Of Payment</FieldLabel>
                  <Select
                    value={formData.modeOfPayment ?? ""}
                    onValueChange={(value) =>
                      setFormData({...formData, modeOfPayment: value})
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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
                </Field>
                <Field>
                  <FieldLabel>TIN</FieldLabel>
                  <Input placeholder="TIN Number" value={formData.tin} onChange={(event) => setFormData({...formData, tin: event.target.value})}/>
                </Field>
              </div> 
              <Field>
                  <FieldLabel>Payee Address</FieldLabel>
                  <Input placeholder="Address of the Payee" value={formData.payeeAddress} onChange={(event) => setFormData({...formData, payeeAddress: event.target.value})}/>
              </Field>  
              <Field>
                <FieldLabel>Terms of Payment</FieldLabel>
                <Textarea placeholder="Terms of Payment" value={formData.termsOfPayment} onChange={(event) => setFormData({...formData, termsOfPayment: event.target.value})}/>
              </Field>  
              <div class='grid grid-cols-2 gap-4'>
                <div class='flex flex-col gap-4'>
                  <Field>
                    <FieldLabel>PR</FieldLabel>
                    <Input placeholder="PR" value={formData.pr} onChange={(event) => setFormData({...formData, pr: event.target.value})}/>
                  </Field>
                  <Field>
                    <FieldLabel>PO</FieldLabel>
                    <Input placeholder="PO" value={formData.po} onChange={(event) => setFormData({...formData, po: event.target.value})}/>
                  </Field>
                  <Field>
                    <FieldLabel>RR</FieldLabel>
                    <Input placeholder="RR" value={formData.rr} onChange={(event) => setFormData({...formData, rr: event.target.value})}/>
                  </Field> 
                </div>  
                <div class='flex flex-col gap-4'>
                  <Field>
                    <FieldLabel>Tax Registration</FieldLabel>
                    <Select
                      value={formData.taxRegistration ?? ""}
                      onValueChange={(value) =>
                        setFormData({...formData, taxRegistration: value})
                      }
                    >
                      <SelectTrigger className="w-[180px]">
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
                  </Field>
                  <Field>
                    <FieldLabel>Type of Businesses</FieldLabel>
                    <Select
                      value={formData.typeOfBusiness ?? ""}
                      onValueChange={(value) =>
                        setFormData({...formData, typeOfBusiness: value})
                      }
                    >
                      <SelectTrigger className="w-[180px]">
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
                  </Field>
                  <Field>
                    <FieldLabel>Currency</FieldLabel>
                    <Input placeholder="Choose a Currency" value={formData.currency} onChange={(event) => setFormData({...formData, currency: event.target.value})}/>
                  </Field> 
                  <Field>
                    <FieldLabel>Amount</FieldLabel>
                    <Input placeholder="Enter Amount" value={formData.amount} onChange={(event) => setFormData({...formData, amount: event.target.value})}/>
                  </Field> 
                  <Field>
                    <FieldLabel>Less: EWT</FieldLabel>
                    <Input placeholder="Enter Withholding Tax" value={formData.lessEWT} onChange={(event) => setFormData({...formData, lessEWT: event.target.value})}/>
                  </Field>
                  <Field>
                    <FieldLabel>Net Total Amount</FieldLabel>
                    <Input readOnly className='focus:ring-0 focus:outline-none focus-visible:ring-0 focus:border-transparent'/>
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

export default PaymentInfo;