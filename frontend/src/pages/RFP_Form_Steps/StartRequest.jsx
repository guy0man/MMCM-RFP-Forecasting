import {use, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import React from 'react';
import api from "../../api";
import { ChevronDownIcon } from "lucide-react"

//shadcn
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

function StartRequest({setPage, formData, setFormData}) {

    //others
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false); 

    const initialForm = {
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
    
            currency:0,
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
    };

    useEffect(() => {
        setFormData(initialForm);
    }, []);



    return (
        <div class='flex flex-col items-center w-screen backdrop-blur-md bg-white/10 p-6'>
            <div class='flex flex-col justify-center items-center w-[600px]'>
                <h1 class='text-[70px] text-center font-bold text-gray-900 mb-[20px] leading-none'>Request For Payment Form</h1>
                <p class='text-[9px] text-center font-medium text-gray-700 max-w-[700px]'>An official document used by university departments, faculty, or staff to request the release or reimbursement of funds for approved expenses. It records key details such as the payee, purpose, amount, funding source, and required authorizations to ensure that financial transactions are properly reviewed and compliant with university accounting procedures before payment is processed.</p>
            </div>
            <div class='mt-[50px]'>
                <Button 
                    className='w-[200px]'
                    variant='outline' 
                    onClick={() => {
                        setPage((currPage) => currPage + 1)
                    }}>Request Now
                </Button>
            </div>
        </div>
    ); 
}

export default StartRequest;