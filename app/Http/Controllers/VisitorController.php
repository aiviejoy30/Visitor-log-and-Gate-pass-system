<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Str; 
use Inertia\Inertia; 

class VisitorController extends Controller
{
    public function create()
    {
        return Inertia::render('VisitorRegister'); 
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_info' => 'required|string|max:255',
            'purpose' => 'required|string|max:255',
            'person_to_visit' => 'required|string|max:255',
        ]);

        $generatedQrCode = Str::random(15); 

        $visitor = Visitor::create([
            'name' => $validated['name'],
            'contact_info' => $validated['contact_info'],
            'purpose' => $validated['purpose'],
            'person_to_visit' => $validated['person_to_visit'],
            'status' => 'Inside',
            'time_in' => now(),
            'qr_code' => $generatedQrCode, 
        ]);

        return back()->with('new_visitor_id', $visitor->id);
    }

    public function success($id)
    {
        $visitor = Visitor::findOrFail($id);

        return Inertia::render('VisitorSuccess',[
            'visitor' => $visitor
        ]);
    }

    public function dashboard()
    {
        $visitors = Visitor::latest()->get();

        return Inertia::render('Dashboard',[
            'visitors' => $visitors
        ]);
    }

    // ✅ EDIT FUNCTION 
    public function update(Request $request, $id)
    {
        $visitor = Visitor::findOrFail($id);

        $visitor->update([
            'name' => $request->name,
            'contact_info' => $request->contact_info,
            'purpose' => $request->purpose,
            'person_to_visit' => $request->person_to_visit,
            'status' => $request->status,
        ]);

        if(strtolower($request->status) == 'outside' && is_null($visitor->time_out)){
            $visitor->update(['time_out' => now()]);
        }

        return back()->with('success', 'Visitor updated successfully!');
    }

    // ✅ NEW: DELETE FUNCTION PARA SA ACTION TABLE
    public function destroy($id)
    {
        $visitor = Visitor::findOrFail($id);
        $visitor->delete();

        return back()->with('success', 'Visitor deleted successfully!');
    }
}
