import { 
    Undo2, 
    X, 
    Info, 
} from "lucide-react"; 
 
export default function ReturnTicketModal({ 
    open, 
    onClose, 
}) { 
    if (!open) return null; 
 
    return ( 
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4"> 
 
            <div className="w-full max-w-[500px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"> 
 
                {/* HEADER */} 
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4"> 
 
                    <div className="flex items-start gap-3"> 
 
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"> 
                            <Undo2 
                                size={18} 
                                className="text-gray-500" 
                            /> 
                        </div> 
 
                        <div> 
                            <h2 className="text-base font-semibold text-black"> 
                                Return to Service Desk 
                            </h2> 
 
                            <p className="mt-0.5 text-sm text-gray-500"> 
                                Return this ticket for review and reclassification. 
                            </p> 
                        </div> 
 
                    </div> 
 
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" 
                    > 
                        <X size={18} /> 
                    </button> 
 
                </div> 
 
                {/* BODY */} 
                <div className="space-y-5 px-5 py-5"> 
 
                    {/* DETAILS */} 
                    <div> 
                        <label 
                            htmlFor="return-details" 
                            className="mb-2 block text-sm font-medium text-black" 
                        > 
                            Additional Details 
                            <span className="ml-1 text-red-500">*</span> 
                        </label> 
 
                        <textarea 
                            id="return-details" 
                            rows={4} 
                            placeholder="Explain why this ticket should be returned to the Service Desk..." 
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#4C4CF9] focus:ring-2 focus:ring-[#4C4CF9]/10" 
                        /> 
                    </div> 
 
                    {/* INFO */} 
                    <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3"> 
 
                        <Info 
                            size={17} 
                            className="mt-0.5 shrink-0 text-gray-500" 
                        /> 
 
                        <p className="text-xs leading-5 text-gray-500"> 
                            Returning this ticket sends it back to the IT Service 
                            Desk for review. The Service Desk can correct the 
                            classification and route the ticket to the appropriate 
                            IT department. 
                        </p> 
 
                    </div> 
 
                </div> 
 
                {/* FOOTER */} 
                <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-5 py-4"> 
 
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="h-9 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer" 
                    > 
                        Cancel 
                    </button> 
 
                    <button 
                        type="button" 
                        className="h-9 rounded-lg bg-[#4C4CF9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3a3ae0] cursor-pointer" 
                    > 
                        Return Ticket 
                    </button> 
 
                </div> 
 
            </div> 
        </div> 
    ); 
}