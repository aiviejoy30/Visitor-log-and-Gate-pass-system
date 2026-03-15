import { useState } from "react";
import { useForm } from "@inertiajs/react";
import GuardLayout from '@/Layouts/GuardLayout';
import QRCode from "react-qr-code";

export default function VisitorRegister() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        contact_info: "",
        purpose: "",
        person_to_visit: "",
    });

    // States para sa Success Modal at QR Data
    const[showQRModal, setShowQRModal] = useState(false);
    const[generatedQRData, setGeneratedQRData] = useState<string | null>(null);

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post("/visitor/store", {
            preserveScroll: true,
            onSuccess: (page: any) => {
                // Kukunin natin yung ID na ibabalik ni Laravel backend, o gagamitin ang pangalan bilang fallback
                const visitorId = page.props.flash?.new_visitor_id || data.name; 
                setGeneratedQRData(visitorId.toString());
                setShowQRModal(true);
                reset(); // I-clear ang form pagkatapos mag-register
            },
            onError: (err) => {
                console.log("Validation errors:", err);
            },
        });
    }

    return (
        <div className="w-full flex justify-center items-center py-8">
            {/* Form Container */}
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                
                {/* Decorative Header Banner */}
                <div className="h-3 w-full bg-gradient-to-r from-blue-500 via-blue-700 to-indigo-800"></div>

                <div className="p-8 sm:p-12">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            Visitor Registration
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">
                            Please fill in the required details to generate a visitor pass.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Juan Dela Cruz" 
                                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 shadow-sm text-gray-800 font-medium"
                                    value={data.name} 
                                    onChange={(e) => setData("name", e.target.value)} 
                                />
                            </div>
                            {errors.name && <div className="text-red-500 text-xs font-bold mt-1.5 ml-1 animate-pulse">{errors.name}</div>}
                        </div>

                        {/* Contact Info Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Contact Information</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Phone number or Email" 
                                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 shadow-sm text-gray-800 font-medium"
                                    value={data.contact_info} 
                                    onChange={(e) => setData("contact_info", e.target.value)} 
                                />
                            </div>
                            {errors.contact_info && <div className="text-red-500 text-xs font-bold mt-1.5 ml-1 animate-pulse">{errors.contact_info}</div>}
                        </div>

                        {/* Two Columns for Purpose and Person to Visit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Purpose */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Purpose of Visit</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Meeting, Delivery" 
                                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 shadow-sm text-gray-800 font-medium"
                                        value={data.purpose} 
                                        onChange={(e) => setData("purpose", e.target.value)} 
                                    />
                                </div>
                                {errors.purpose && <div className="text-red-500 text-xs font-bold mt-1.5 ml-1 animate-pulse">{errors.purpose}</div>}
                            </div>

                            {/* Person to Visit */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Person to Visit</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Mr. Smith" 
                                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 shadow-sm text-gray-800 font-medium"
                                        value={data.person_to_visit} 
                                        onChange={(e) => setData("person_to_visit", e.target.value)} 
                                    />
                                </div>
                                {errors.person_to_visit && <div className="text-red-500 text-xs font-bold mt-1.5 ml-1 animate-pulse">{errors.person_to_visit}</div>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                                        Register & Generate QR
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ✅ SUCCESS & QR CODE MODAL */}
            {showQRModal && (
                <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full transform transition-all scale-100 animate-fade-in-up">
                        
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 shadow-inner">
                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Access Granted!</h2>
                        <p className="text-gray-500 mb-8 font-medium">Please screenshot or save this QR code. You will need it to enter.</p>
                        
                        {/* QR Code Container - Looks like a pass */}
                        <div className="flex justify-center mb-8 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 transform -skew-y-3 rounded-2xl -z-10 shadow-sm"></div>
                            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-300 shadow-sm">
                                {generatedQRData && <QRCode value={generatedQRData} size={200} />}
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowQRModal(false)}
                            className="bg-gray-900 text-white font-bold px-6 py-4 rounded-xl w-full hover:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

VisitorRegister.layout = (page: React.ReactNode) => <GuardLayout>{page}</GuardLayout>;
