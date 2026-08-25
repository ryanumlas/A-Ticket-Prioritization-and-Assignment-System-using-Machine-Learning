import { useParams } from "react-router-dom";
import ReviewContent from './FlagReason/ReviewContent';
import api from "../api";
import { useState, useEffect } from 'react';

export default function FlaggedTicketDetailsServiceDesk() {
    const { id } = useParams();
    const [flag, setFlag] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlagTicketDetail = async () => {
            try {
                const response = await api.get(`/tickets/flagged-detail/${id}/`);
                setFlag(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchFlagTicketDetail();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return(
        <div>
            <ReviewContent flag={flag} />
        </div>
    );
}

// -- LOW CONFIDENCE FLAG --
// show UI Subject, COde, Description, affectged scope, primary prediction, secondary prediction, confidence, second confidence, and margin. 
// actions can do Accept the prediction or manualy override the prediction code

// -- MISSING DEPARTMENT FLAG --
// show ticket details, detected symptom code + category + department fields
// actions can do select/assign department

// --UNCLEAR DESCRIPTION FLAG --
// show ticket details + gemini /summary 
// actions can do return the ticket to the employee if the ticket is unclear or manually classify if enough content exists