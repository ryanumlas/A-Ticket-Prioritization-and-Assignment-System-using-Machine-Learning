import api from "../api";
import { useEffect, useState } from "react";
import { Wrench, Check, FolderOpen, FolderSearch } from "lucide-react"

export default function OverviewEmployee({ overview }) {
    return(
        <div className="w-150 border border-gray-300 rounded-xl p-4">
            <h1 className="font-semibold text-xl mb-4">Quick Overview</h1>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
                <div className="bg-white border border-gray-300 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <FolderOpen size={20}/>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500 pb-2">Total Open</p>
                        <p className="text-2xl text-gray-800">{overview.open}</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-300 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Wrench size={20}/>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500 pb-2">Total In Progress</p>
                        <p className="text-2xl text-gray-800">{overview.in_progress}</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-300 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <Check size={20}/>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500 pb-2">Total Resolved</p>
                        <p className="text-2xl text-gray-800">{overview.resolved}</p>
                    </div>
                </div>
                <div className="bg-white border border-gray-300 p-4 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <FolderSearch size={20}/>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500 pb-2">Total Under Review</p>
                        <p className="text-2xl text-gray-800">{overview.under_review}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}