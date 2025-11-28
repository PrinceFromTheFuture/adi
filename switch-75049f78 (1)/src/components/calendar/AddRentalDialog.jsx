import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "@/components/common/LanguageProvider";

export default function AddRentalDialog({ isOpen, onClose, onSubmit, dresses, initialDate }) {
  const { t } = useTranslation();
  const [rentalData, setRentalData] = useState({
    dress_id: "",
    start_date: initialDate || new Date(),
    end_date: initialDate || new Date(),
    renter_name: "",
    notes: ""
  });

  useEffect(() => {
    if (initialDate) {
      setRentalData(prev => ({
        ...prev,
        start_date: initialDate,
        end_date: initialDate,
      }));
    }
  }, [initialDate]);

  const handleDateRangeSelect = (range) => {
    if (range?.from) {
      setRentalData(prev => ({
        ...prev,
        start_date: range.from,
        end_date: range.to || range.from
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rentalData.dress_id || !rentalData.start_date || !rentalData.end_date) {
      alert("Please select a dress and date range.");
      return;
    }
    onSubmit({
      ...rentalData,
      start_date: format(rentalData.start_date, 'yyyy-MM-dd'),
      end_date: format(rentalData.end_date, 'yyyy-MM-dd'),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Schedule a Rental')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Dress')}</label>
            <Select 
              value={rentalData.dress_id} 
              onValueChange={(value) => setRentalData(prev => ({ ...prev, dress_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Select a dress')} />
              </SelectTrigger>
              <SelectContent>
                {dresses.map(dress => (
                  <SelectItem key={dress.id} value={dress.id}>{dress.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Rental Dates')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {rentalData.start_date ? (
                    rentalData.end_date ? (
                      `${format(rentalData.start_date, "LLL dd, y")} - ${format(rentalData.end_date, "LLL dd, y")}`
                    ) : (
                      format(rentalData.start_date, "LLL dd, y")
                    )
                  ) : (
                    <span>{t('Pick a date range')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={rentalData.start_date}
                  selected={{ from: rentalData.start_date, to: rentalData.end_date }}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Renter Name (Optional)')}</label>
            <Input
              value={rentalData.renter_name}
              onChange={(e) => setRentalData(prev => ({ ...prev, renter_name: e.target.value }))}
              placeholder={t('e.g., Jane Doe')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Notes (Optional)')}</label>
            <Textarea
              value={rentalData.notes}
              onChange={(e) => setRentalData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('e.g., Pickup at 5pm')}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">{t('Cancel')}</Button>
            </DialogClose>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700">{t('Save Rental')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}