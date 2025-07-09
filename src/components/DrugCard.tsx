'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Activity, Route, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface DrugCardProps {
  drugName: string;
  totalEvents: number;
  seriousEvents: number;
  administrationRoutes: string[];
  pharmacologicalClass: string;
  drugSlug: string;
}

export default function DrugCard({
  drugName,
  totalEvents,
  seriousEvents,
  administrationRoutes,
  pharmacologicalClass,
  drugSlug,
}: DrugCardProps) {
  const seriousPercentage = totalEvents > 0 ? Math.round((seriousEvents / totalEvents) * 100) : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pill className="h-5 w-5 text-blue-600" />
          {drugName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{totalEvents.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{seriousEvents.toLocaleString()}</div>
            <div className="text-sm text-red-600">Serious Events</div>
          </div>
        </div>

        {/* Serious Events Percentage */}
        {totalEvents > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-gray-600">
              {seriousPercentage}% of events are serious
            </span>
          </div>
        )}

        {/* Administration Routes */}
        {administrationRoutes.length > 0 && (
          <div className="flex items-start gap-2">
            <Route className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {administrationRoutes.slice(0, 3).map((route, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {route}
                </span>
              ))}
              {administrationRoutes.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{administrationRoutes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pharmacological Class */}
        {pharmacologicalClass && (
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{pharmacologicalClass}</span>
          </div>
        )}

        {/* View Details Button */}
        <Link href={`/drug/${drugSlug}`} className="block">
          <Button className="w-full" variant="outline">
            View Analytics
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 