import React, { useState } from "react";
import { format } from "date-fns";
import { Trash2, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/common/LanguageProvider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function RentalEventCard({ event, dress, onDelete, isOwner }) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(event.id);
    // No need to set isDeleting to false as the component will be unmounted
  };

  return (
    <div className="border border-rose-100 bg-rose-50/50 rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-rose-600" />
            <p className="font-semibold text-gray-800">{dress?.name || t('Dress not found')}</p>
          </div>
          {event.renter_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <p>{t('Rented to:')} {event.renter_name}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(event.start_date), 'PPP')} - {format(new Date(event.end_date), 'PPP')}
          </p>
        </div>
        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('This will permanently delete this rental event. This action cannot be undone.')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                  {isDeleting ? t('Deleting...') : t('Delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {event.notes && (
        <div className="mt-3 pt-3 border-t border-rose-200">
          <p className="text-sm text-gray-700">{event.notes}</p>
        </div>
      )}
    </div>
  );
}