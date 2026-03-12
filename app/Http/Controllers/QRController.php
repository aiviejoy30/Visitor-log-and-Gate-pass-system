<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visitor;
use Carbon\Carbon;

class QRController extends Controller
{
    public function scan(Request $request)
    {
        $originalVisitor = Visitor::find($request->visitor_id);

        if (!$originalVisitor) {
            return response()->json([
                "message" => "Visitor not found"
            ], 404);
        }

        // Hanapin ang pinaka-latest record niya base sa name at contact info
        $latestVisit = Visitor::where('name', $originalVisitor->name)
                              ->where('contact_info', $originalVisitor->contact_info)
                              ->latest('created_at')
                              ->first();

        $now = now();
        $hoursDiff = $latestVisit->created_at->diffInHours($now);
        $currentStatus = strtolower($latestVisit->status);

        // ---------------------------------------------------------
        // KONDISYON 1: LAGPAS 24 HOURS (Panibagong araw na ito)
        // ---------------------------------------------------------
        if ($hoursDiff >= 24) {
            
            // Kung nakalimutan niyang mag-OUT kahapon, i-Expired natin yung luma
            if (in_array($currentStatus, ['in', 'inside'])) {
                $latestVisit->update([
                    'status' => 'Expired'
                ]);
            }
            // Note: Kung naka "Out" na siya, safe yun, HINDI papalitan to Expired.

            // Gagawa tayo AUTOMATIC ng panibagong IN para magamit ang QR today
            $newVisit = Visitor::create([
                'name' => $latestVisit->name,
                'contact_info' => $latestVisit->contact_info,
                'purpose' => $latestVisit->purpose,
                'person_to_visit' => $latestVisit->person_to_visit,
                'status' => 'Inside',
                'time_in' => $now,
                'qr_code' => $latestVisit->qr_code // Keep the same QR logic if any
            ]);

            return response()->json([
                "message" => "New Day! " . $newVisit->name . " TIME IN"
            ]);
        }

        // ---------------------------------------------------------
        // KONDISYON 2: WALA PANG 24 HOURS (Nasa iisang araw lang)
        // ---------------------------------------------------------
        
        if (in_array($currentStatus,['in', 'inside'])) {
            // Nasa loob siya, kaya TIME OUT natin
            $latestVisit->update([
                'status' => 'Outside',
                'time_out' => $now
            ]);

            return response()->json([
                "message" => $latestVisit->name . " TIME OUT"
            ]);
        } else {
            // Naka-OUT na siya pero bumalik ulit within the day, TIME IN ulit
            $reEntry = Visitor::create([
                'name' => $latestVisit->name,
                'contact_info' => $latestVisit->contact_info,
                'purpose' => $latestVisit->purpose,
                'person_to_visit' => $latestVisit->person_to_visit,
                'status' => 'Inside',
                'time_in' => $now,
                'qr_code' => $latestVisit->qr_code
            ]);

            return response()->json([
                "message" => $reEntry->name . " Re-entered (TIME IN)"
            ]);
        }
    }
}
