
import React, { useState, useEffect, useCallback } from "react";
import { format, startOfDay } from "date-fns";
import { Dress } from "@/api/entities";
import { RentalEvent } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarDays } from "lucide-react";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { useTranslation } from "@/components/common/LanguageProvider";

import AddRentalDialog from "../calendar/AddRentalDialog";
import RentalEventCard from "../calendar/RentalEventCard";

export default function PublicCalendarView({ ownerId, isOwnProfile }) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [events, setEvents] = useState([]);
  const [userDresses, setUserDresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = useCallback(async () => {
    if (!ownerId) return;
    setIsLoading(true);
    try {
      const [fetchedEvents, fetchedDresses] = await Promise.all([
        RentalEvent.filter({ owner_id: ownerId }),
        Dress.filter({ owner_id: ownerId }),
      ]);
      setEvents(fetchedEvents || []);
      setUserDresses(fetchedDresses || []);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
    setIsLoading(false);
  }, [ownerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const eventsOnSelectedDate = events.filter(event => {
    const eventStart = startOfDay(new Date(event.start_date));
    const eventEnd = startOfDay(new Date(event.end_date));
    const current = startOfDay(selectedDate);
    return current >= eventStart && current <= eventEnd;
  });

  const handleAddRental = async (rentalData) => {
    if (!isOwnProfile) return;
    try {
      await RentalEvent.create({ ...rentalData, owner_id: ownerId });
      setIsDialogOpen(false);
      fetchData(); // Refresh data
      setSuccessMessage("Rental saved successfully ✅");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error creating rental event:", error);
    }
  };

  const handleDeleteRental = async (eventId) => {
    if (!isOwnProfile) return;

    const originalEvents = events;
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));

    try {
      await RentalEvent.delete(eventId);
      // UI is already updated, no need to call fetchData()
    } catch (error) {
      console.error("Error deleting rental event:", error);
      // Revert the UI on error
      setEvents(originalEvents);
      alert("Failed to delete rental event. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-xl text-center">
          {successMessage}
        </div>
      )}
      <div className="space-y-6">
        {isOwnProfile && userDresses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-rose-100">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-rose-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">{t('No dresses to track')}</h4>
            <p className="text-gray-500 max-w-sm mx-auto">{t('Add dresses to your closet first, then you can track their rental schedule')}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-4 flex justify-center">
              <ShadcnCalendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="p-0"
                modifiers={{
                  rented: events.flatMap(event => {
                    const dates = [];
                    let currentDate = startOfDay(new Date(event.start_date));
                    const endDate = startOfDay(new Date(event.end_date));
                    while (currentDate <= endDate) {
                      dates.push(new Date(currentDate));
                      currentDate.setDate(currentDate.getDate() + 1);
                    }
                    return dates;
                  })
                }}
                modifiersStyles={{
                  rented: {
                    color: 'white',
                    backgroundColor: '#E11D48',
                  }
                }}
              />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('Rentals on {date}', { date: format(selectedDate, 'PPP') })}
                </h3>
                {isOwnProfile && (
                  <Button onClick={() => setIsDialogOpen(true)} size="sm" className="bg-rose-600 hover:bg-rose-700">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {t('Add Rental')}
                  </Button>
                )}
              </div>
              
              {eventsOnSelectedDate.length > 0 ? (
                <div className="space-y-3">
                  {eventsOnSelectedDate.map(event => (
                    <RentalEventCard
                      key={event.id}
                      event={event}
                      dress={userDresses.find(d => d.id === event.dress_id)}
                      onDelete={handleDeleteRental}
                      isOwner={isOwnProfile}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6">{t('No rentals scheduled for this date.')}</p>
              )}
            </div>
          </>
        )}
      </div>
      
      {isOwnProfile && (
        <AddRentalDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleAddRental}
          dresses={userDresses}
          initialDate={selectedDate}
        />
      )}
    </>
  );
}
