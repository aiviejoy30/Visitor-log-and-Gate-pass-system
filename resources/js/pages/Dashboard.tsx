import { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react"; 
import GuardLayout from "@/layouts/GuardLayout";
import QRCode from "react-qr-code";

export default function Dashboard({ visitors =[] }: any) {
    const [viewQR, setViewQR] = useState<string | null>(null);
    const [editingVisitor, setEditingVisitor] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data, setData, put, processing, reset } = useForm({
        name: "",
        contact_info: "",
        purpose: "",
        person_to_visit: "",
        status: ""
    });

    // ----------------------------------------------------
    // HELPER FUNCTIONS 
    // ----------------------------------------------------
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "---";
        const date = new Date(String(dateString).replace('Z', '').replace(' ', 'T'));
        if (isNaN(date.getTime())) return "---"; 
        date.setHours(date.getHours() + 1);
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`;
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return "---";
        const date = new Date(String(dateString).replace('Z', '').replace(' ', 'T'));
        if (isNaN(date.getTime())) return "---"; 
        date.setHours(date.getHours() + 1);
        return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const checkIsExpired = (v: any) => {
        if (!v || !v.created_at) return false;
        const status = v.status?.toLowerCase();
        if (status === "out" || status === "outside") return false;

        const date = new Date(String(v.created_at).replace('Z', '').replace(' ', 'T'));
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        return diffInHours >= 24;
    };

    // ----------------------------------------------------
    // CALCULATIONS PARA SA DASHBOARD STATS
    // ----------------------------------------------------
    const totalVisitors = visitors ? visitors.length : 0;
    
    const currentlyInside = visitors ? visitors.filter((v: any) => {
        const isIn = v.status?.toLowerCase() === "inside" || v.status?.toLowerCase() === "in";
        const isExp = checkIsExpired(v);
        return isIn && !isExp; 
    }).length : 0;
    
    const visitorsToday = visitors ? visitors.filter((v: any) => {
        if (!v || !v.created_at) return false;
        const visitDate = new Date(String(v.created_at).replace('Z', '').replace(' ', 'T'));
        if (isNaN(visitDate.getTime())) return false;
        visitDate.setHours(visitDate.getHours() + 1);
        return visitDate.toDateString() === new Date().toDateString();
    }).length : 0;

    // ----------------------------------------------------
    // SEARCH / FILTER LOGIC
    // ----------------------------------------------------
    const filteredVisitors = visitors ? visitors.filter((v: any) => {
        if (!v) return false;
        const isOut = v.status?.toLowerCase() === "outside" || v.status?.toLowerCase() === "out";
        const searchString = `${v.name} ${v.contact_info} ${v.purpose} ${v.person_to_visit} ${v.status}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
    }) :[];

    // ----------------------------------------------------
    // ACTIONS (EDIT & DELETE)
    // ----------------------------------------------------
    useEffect(() => {
        if (editingVisitor) {
            setData({
                name: editingVisitor.name || "",
                contact_info: editingVisitor.contact_info || "",
                purpose: editingVisitor.purpose || "",
                person_to_visit: editingVisitor.person_to_visit || "",
                status: editingVisitor.status || "Inside",
            });
        }
    }, [editingVisitor]);

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingVisitor || !editingVisitor.id) return;

        put(`/visitor/${editingVisitor.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingVisitor(null);
                reset();
            }
        });
    }

    function deleteVisitor(id: number) {
        if (window.confirm("Are you sure you want to delete this visitor?")) {
            router.delete(`/visitor/${id}`, { preserveScroll: true });
        }
    }

    return (
        <GuardLayout>
            <div className="w-full">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Guard Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and monitor visitor logs</p>
                    </div>
                    <div className="bg-white px-5 py-2 rounded-full shadow border border-gray-100 font-semibold text-blue-700 flex items-center gap-2 hover:shadow-md transition-shadow cursor-default">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                        Active Duty
                    </div>
                </div>

                {/* Statistics Cards - Mas maliit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default">
                        <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Visitors Today</p>
                        <h2 className="text-3xl font-black mt-1">{visitorsToday}</h2> 
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default">
                        <p className="text-green-100 text-xs font-medium uppercase tracking-wider">Currently Inside</p>
                        <h2 className="text-3xl font-black mt-1">{currentlyInside}</h2>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default">
                        <p className="text-purple-100 text-xs font-medium uppercase tracking-wider">All Visitors</p>
                        <h2 className="text-3xl font-black mt-1">{totalVisitors}</h2>
                    </div>
                </div>

                {/* Table Container - Sagad pababa, pero scrollable */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-[calc(100vh-240px)] overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white shrink-0 z-20">
                        <h3 className="text-2xl font-bold text-gray-800">Visitor Logs</h3>
                        <div className="relative w-full md:w-1/3">
                            <input 
                                type="text" 
                                placeholder="Search visitors..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 outline-none transition-all duration-300 shadow-sm"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>

                    <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar">
                        <table className="min-w-full text-left border-collapse relative">
                            <thead className="bg-gray-50/90 backdrop-blur-sm text-gray-500 text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-5 font-bold">QR Code</th>
                                    <th className="p-5 font-bold">Name</th>
                                    <th className="p-5 font-bold">Contact Info</th>
                                    <th className="p-5 font-bold">Purpose</th>
                                    <th className="p-5 font-bold">Visit Target</th>
                                    <th className="p-5 font-bold text-indigo-600">Date</th>
                                    <th className="p-5 font-bold text-blue-600">Time In</th>
                                    <th className="p-5 font-bold text-red-600">Time Out</th>
                                    <th className="p-5 font-bold text-center">Status</th>
                                    <th className="p-5 font-bold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm bg-white">
                                {filteredVisitors.length > 0 ? (
                                    filteredVisitors.map((v: any, index: number) => {
                                        const isOut = v.status?.toLowerCase() === "outside" || v.status?.toLowerCase() === "out";
                                        const isIn = v.status?.toLowerCase() === "inside" || v.status?.toLowerCase() === "in";
                                        const isExpired = checkIsExpired(v);

                                        const displayStatus = v.status?.toLowerCase() === "expired" || isExpired ? "Expired" : v.status;

                                        return (
                                            <tr key={v.id || index} className="hover:bg-blue-50/80 transition-colors duration-300 group">
                                                <td className="p-4 pl-5">
                                                    <div 
                                                        onClick={() => setViewQR(v.id?.toString() || "")} 
                                                        className="p-1.5 inline-block border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md hover:scale-110 hover:border-blue-300 transition-all duration-300 cursor-pointer"
                                                    >
                                                        <QRCode value={v.id ? v.id.toString() : "Unknown"} size={36} />
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-800">{v.name}</td>
                                                <td className="p-4 text-gray-600 font-medium">{v.contact_info || "N/A"}</td>
                                                <td className="p-4 text-gray-600 truncate max-w-[150px] font-medium" title={v.purpose}>{v.purpose}</td>
                                                <td className="p-4 text-gray-600 font-medium">{v.person_to_visit}</td>
                                                <td className="p-4 font-bold text-indigo-600 tracking-wider">{formatDate(v.created_at)}</td>
                                                <td className="p-4 font-bold text-blue-600 whitespace-nowrap">{formatTime(v.time_in || v.created_at)}</td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {isOut ? (
                                                        <span className="inline-block bg-red-50 text-red-600 px-3 py-1 rounded-full font-extrabold text-xs shadow-sm border border-red-100">
                                                            {formatTime(v.time_out ? v.time_out : (v.updated_at ? v.updated_at : v.created_at))}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 font-bold">--:--</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {displayStatus === "Expired" ? (
                                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 shadow-sm">
                                                            Expired
                                                        </span>
                                                    ) : (
                                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                                                            isIn ? "bg-green-100 text-green-700 border border-green-200" : 
                                                            isOut ? "bg-gray-100 text-gray-500 border border-gray-200" : "bg-gray-100 text-gray-500"
                                                        }`}>
                                                            {v.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center whitespace-nowrap space-x-2">
                                                    <button 
                                                        onClick={() => setEditingVisitor(v)} 
                                                        className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteVisitor(v.id)} 
                                                        className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="p-16 text-center text-gray-400 font-medium text-lg">
                                            {searchTerm ? `No results found for "${searchTerm}"` : "No visitors recorded yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* QR VIEW MODAL */}
            {viewQR && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full transform transition-all animate-fade-in-up">
                        <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">QR Code</h2>
                        <div className="p-4 border-2 border-gray-100 rounded-2xl inline-block bg-white shadow-inner mb-6">
                            <QRCode value={viewQR} size={220} />
                        </div>
                        <button 
                            onClick={() => setViewQR(null)} 
                            className="bg-gray-900 text-white px-6 py-3.5 rounded-xl w-full font-bold hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* EDIT VISITOR MODAL */}
            {editingVisitor && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Edit Visitor</h2>
                            <button 
                                onClick={() => setEditingVisitor(null)} 
                                className="text-gray-400 hover:text-red-500 hover:rotate-90 hover:scale-125 transition-all duration-300 p-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <form onSubmit={submitEdit} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Name</label>
                                <input type="text" className="border border-gray-200 p-3.5 w-full rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 outline-none shadow-sm text-sm font-medium" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Contact Info</label>
                                <input type="text" className="border border-gray-200 p-3.5 w-full rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 outline-none shadow-sm text-sm font-medium" value={data.contact_info} onChange={(e) => setData("contact_info", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Purpose</label>
                                <input type="text" className="border border-gray-200 p-3.5 w-full rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 outline-none shadow-sm text-sm font-medium" value={data.purpose} onChange={(e) => setData("purpose", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Person to Visit</label>
                                <input type="text" className="border border-gray-200 p-3.5 w-full rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 outline-none shadow-sm text-sm font-medium" value={data.person_to_visit} onChange={(e) => setData("person_to_visit", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                                <select className="border border-gray-200 p-3.5 w-full rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 outline-none shadow-sm text-sm font-bold text-gray-700" value={data.status} onChange={(e) => setData("status", e.target.value)}>
                                    <option value="Inside">Inside</option>
                                    <option value="Outside">Outside</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => { setEditingVisitor(null); reset(); }} className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 hover:shadow-md transition-all duration-300">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </GuardLayout>
    );
}
