import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import GuardLayout from "@/Layouts/GuardLayout";

export default function Scanner() {
    // UI State
    const[feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
    
    // Refs para maiwasan ang double camera at API spam
    const isProcessing = useRef(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        // Siguraduhing isang instance lang ng scanner ang nagagawa
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }
        
        const scanner = scannerRef.current;

        const startScanner = async () => {
            if (scanner.isScanning) return;

            // Scanner Settings (Mabilis na pag-scan)
            const scanConfig = { 
                fps: 30, 
                qrbox: { width: 300, height: 300 },
                aspectRatio: 1.0, 
                disableFlip: false 
            };

            // Success Function kapag nakabasa ng QR
            const onScanSuccess = async (decodedText: string) => {
                if (isProcessing.current) return;
                
                isProcessing.current = true;
                
                try {
                    const res = await axios.post("/scan-visitor", {
                        visitor_id: decodedText
                    });
                    
                    setFeedback({ message: res.data.message || "Visitor verified successfully!", type: "success" });
                } catch (error: any) {
                    console.error("Error scanning visitor:", error);
                    const errorMsg = error.response?.data?.message || "Invalid or Unrecognized QR Code";
                    setFeedback({ message: errorMsg, type: "error" });
                } finally {
                    setTimeout(() => {
                        isProcessing.current = false;
                        setFeedback(null);
                    }, 1500); 
                }
            };

            // Error Function habang naghahanap ng QR (ignored para hindi maingay sa console)
            const onScanFailure = (errorMessage: string) => {
                // Ignore
            };

            try {
                // 1st TRY: Subukan ang Back Camera (Para sa mobile phones)
                await scanner.start(
                    { facingMode: "environment" }, 
                    scanConfig, 
                    onScanSuccess, 
                    onScanFailure
                );
                console.log("Started back camera.");
            } catch (err) {
                console.warn("Back camera failed or not found, switching to laptop/front camera...", err);
                
                try {
                    // 2nd TRY: Kapag nag-error (tulad sa HP laptop mo), gagamitin ang Front Camera
                    await scanner.start(
                        { facingMode: "user" }, 
                        scanConfig, 
                        onScanSuccess, 
                        onScanFailure
                    );
                    console.log("Started front/laptop camera.");
                } catch (fallbackErr) {
                    console.error("Failed to start both cameras", fallbackErr);
                    setFeedback({ message: "Camera access denied or no camera found. Please allow camera permissions.", type: "error" });
                }
            }
        };

        startScanner();

        // Cleanup: I-stop at i-clear ang DOM kapag umalis sa page
        return () => {
            if (scanner && scanner.isScanning) {
                scanner.stop().then(() => {
                    scanner.clear();
                }).catch((err) => console.log("Error stopping scanner", err));
            }
        };
    },[]);

    return (
        <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
            
            {/* Custom CSS para sa scanning line animation at pag-hide ng default borders */}
            <style>
                {`
                    @keyframes scan {
                        0% { transform: translateY(-110px); opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { transform: translateY(110px); opacity: 0; }
                    }
                    .animate-scan {
                        animation: scan 2s infinite linear;
                    }
                    /* Customizing html5-qrcode output */
                    #reader { border: none !important; }
                    #reader video { border-radius: 1rem; object-fit: cover; }
                `}
            </style>

            <div className="w-full max-w-md mx-auto flex flex-col items-center">
                
                {/* Header Info */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">QR Scanner Portal</h1>
                    <p className="text-gray-500 font-medium mt-1">Position the visitor's QR code inside the frame</p>
                </div>

                {/* Camera Container (PRO Design) */}
                <div className="relative bg-white p-4 rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-sm flex flex-col items-center justify-center">
                    
                    {/* Viewfinder Decorative Corners */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl z-10 pointer-events-none"></div>
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl z-10 pointer-events-none"></div>
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl z-10 pointer-events-none"></div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl z-10 pointer-events-none"></div>

                    {/* Scanning Line Animation */}
                    <div className="absolute inset-0 z-20 pointer-events-none flex justify-center items-center">
                        <div className="w-3/4 h-1 bg-blue-400 shadow-[0_0_15px_3px_rgba(59,130,246,0.6)] animate-scan rounded-full"></div>
                    </div>

                    <div 
                        id="reader" 
                        className="w-full aspect-square bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner"
                    >
                        {/* Initial Loading State Design */}
                        <div className="absolute text-gray-400 flex flex-col items-center justify-center animate-pulse z-0">
                            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-sm font-semibold tracking-wider">Starting Camera...</span>
                        </div>
                    </div>
                </div>

                {/* Feedback Message Section */}
                <div className="h-24 mt-8 w-full max-w-sm">
                    {feedback ? (
                        <div className={`flex items-center gap-4 p-5 rounded-2xl shadow-xl transform transition-all animate-fade-in-up border ${
                            feedback.type === "success" 
                                ? "bg-green-50 border-green-200" 
                                : "bg-red-50 border-red-200"
                        }`}>
                            <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                                feedback.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}>
                                {feedback.type === "success" ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                )}
                            </div>
                            <div>
                                <h3 className={`font-black text-lg ${feedback.type === "success" ? "text-green-800" : "text-red-800"}`}>
                                    {feedback.type === "success" ? "Success!" : "Scan Failed"}
                                </h3>
                                <p className={`text-sm font-bold ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}>
                                    {feedback.message}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 font-bold bg-gray-200/50 rounded-2xl border-2 border-gray-200 border-dashed">
                            <span className="animate-pulse">Ready to scan...</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

// Layout configuration
Scanner.layout = (page: React.ReactNode) => <GuardLayout>{page}</GuardLayout>;
