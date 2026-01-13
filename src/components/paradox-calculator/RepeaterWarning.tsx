"use client";

import { AlertTriangle, Radio } from 'lucide-react';

const RepeaterWarning = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <div>
        <h4 className="font-medium text-amber-800 mb-1">
          Important: Siren Range Limitation
        </h4>
        <p className="text-sm text-amber-700 leading-relaxed">
          The SR230 wireless siren <strong>cannot work via repeaters</strong> and must be installed 
          within direct range of your control panel. If you have a large property with a repeater, 
          plan your siren placement carefully.
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-amber-600">
          <Radio className="w-4 h-4" />
          Direct panel connection required
        </div>
      </div>
    </div>
  );
};

export default RepeaterWarning;
