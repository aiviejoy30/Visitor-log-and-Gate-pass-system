<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VisitorController extends Controller
{
    // Show the visitor registration form
    public function create()
    {
        return Inertia::render('VisitorRegister');
    }

    // Store a new visitor
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_info' => 'required|string|max:255',
            'purpose' => 'required|string|max:255',
            'person_to_visit' => 'required|string|max:255',
        ]);

        $generatedQrCode = Str::upper(Str::random(8)); // shorter and uppercase QR

        $visitor = Visitor::create([
            'name' => $validated['name'],
            'contact_info' => $validated['contact_info'],
            'purpose' => $validated['purpose'],
            'person_to_visit' => $validated['person_to_visit'],
            'status' => 'Inside',
            'time_in' => now(),
            'qr_code' => $generatedQrCode,
        ]);

        return back()->with([
            'status' => 'success',
            'message' => "Visitor {$visitor->name} registered successfully!",
            'visitor_id' => $visitor->id,
            'qr_code' => $visitor->qr_code
        ]);
    }

    // Show the success page for a visitor
    public function success($id)
    {
        $visitor = Visitor::findOrFail($id);

        return Inertia::render('VisitorSuccess', [
            'visitor' => $visitor,
            'status' => 'success',
            'message' => "Visitor {$visitor->name} checked in successfully."
        ]);
    }

    // Show the dashboard with all visitors
    public function dashboard()
    {
        $visitors = Visitor::latest()->get();

        return Inertia::render('Dashboard', [
            'visitors' => $visitors,
            'total_visitors' => $visitors->count()
        ]);
    }

    // Update visitor info
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

        // Automatically set time_out if status changed to outside
        if (strtolower($request->status) === 'outside' && is_null($visitor->time_out)) {
            $visitor->update(['time_out' => now()]);
        }

        return back()->with([
            'status' => 'success',
            'message' => "Visitor {$visitor->name} updated successfully!"
        ]);
    }

    // Delete a visitor
    public function destroy($id)
    {
        $visitor = Visitor::findOrFail($id);
        $visitor->delete();

        return back()->with([
            'status' => 'success',
            'message' => 'Visitor deleted successfully!'
        ]);
    }
}
