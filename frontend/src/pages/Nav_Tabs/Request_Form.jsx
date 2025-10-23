import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import React from 'react';
import api from "../../api";
import { ChevronDownIcon } from "lucide-react"
import StartRequest from '../RFP_Form_Steps/StartRequest';
import PrimaryInfo from '../RFP_Form_Steps/PrimaryInfo';
import BankDetails from '../RFP_Form_Steps/BankDetails';
import PaymentInfo from '../RFP_Form_Steps/PaymentInfo';
import Instructions from '../RFP_Form_Steps/Instructions';
import ConfirmDetails from '../RFP_Form_Steps/ConfirmDetails';

//shadcn
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

function Request_Form() {
    const [page,setPage] = useState(0);

    const [formData, setFormData] = useState({
        requestedBy: "",
        payableTo: "",
        description: "",
        dateNeeded: "",

        bankName:"",
        accountName:"",
        accountNumber:"",
        swiftCode:"",
        contactPerson: "",
        contactNumber: "",
        email: "",

        termsOfPayment: "",
        pr:"",
        po:"",
        rr:"",

        tin:"",
        payeeAddress:"",

        currency:"",
        amount:0,
        serviceFee:0,
        lessEWT:0,

        instruction:"",

        department:"",
        sourceOfFund:"",
        transactionType:"",
        typeOfBusiness:"",
        modeOfPayment:"",
        taxRegistration:"",
    });

    const PageDisplay = () => {
        if (page === 0) {
            return <StartRequest setPage={setPage} formData={formData} setFormData={setFormData} />
        } else if (page === 1){
            return <PrimaryInfo setPage={setPage} formData={formData} setFormData={setFormData}/>
        } else if (page === 2){
            return <BankDetails setPage={setPage} formData={formData} setFormData={setFormData}/>
        } else if (page === 3){
            return <PaymentInfo setPage={setPage} formData={formData} setFormData={setFormData}/>
        } else if (page === 4){
            return <Instructions setPage={setPage} formData={formData} setFormData={setFormData}/>
        } else if (page === 5){
            return <ConfirmDetails setPage={setPage} formData={formData} setFormData={setFormData}/>
        }
    }
    
    return (
        <div className='flex flex-col justify-center h-screen w-screen w-screen backdrop-blur-md bg-white/10 p-6'>
            {PageDisplay()}
        </div>
    ); 
}

export default Request_Form;