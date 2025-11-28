
import React, { useState } from "react";
import { Plus, Edit, Trash2, Images, GripVertical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dress } from "@/api/entities";
import ImageLightbox from "../common/ImageLightbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function DressGrid({ dresses, isOwnProfile, onRefresh }) {
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const navigate = useNavigate();

  const openLightbox = (dressImages, startIndex) => {
    setLightboxImages(dressImages);
    setLightboxStartIndex(startIndex);
    setIsLightboxOpen(true);
  };

  const handleDelete = async (dressId) => {
    try {
      await Dress.delete(dressId);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete dress:", error);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    // Create a mutable copy of the dresses array
    const items = Array.from(dresses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Optimistic update - this re-renders the component with the new order
    // as if onRefresh was called and fetched the new order.
    // However, since `dresses` is a prop, we need the parent to provide updated `dresses`.
    // The outline asks for onRefresh, implying the parent will re-fetch.
    // This first onRefresh forces the parent to update its state which then re-renders this component with reordered `dresses` prop.
    onRefresh(); 

    try {
        // Prepare updates for the backend
        const updatePromises = items.map((dress, index) => 
            Dress.update(dress.id, { displayOrder: index })
        );
        await Promise.all(updatePromises);
        onRefresh(); // Refresh with final state from DB after successful update
    } catch(e) {
        console.error("Failed to update dress order", e);
        onRefresh(); // Revert on failure by refreshing from DB
    }
  };

  return (
    <>
      <ImageLightbox
        images={lightboxImages}
        startIndex={lightboxStartIndex}
        open={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
      />
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isOwnProfile ? 'My Dresses' : 'Dresses'}
          </h3>
          {isOwnProfile && (
            <Link to={createPageUrl("AddDress")}>
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Dress
              </Button>
            </Link>
          )}
        </div>

        {dresses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-rose-100">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-rose-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? 'No dresses yet' : 'No dresses available'}
            </h4>
            <p className="text-gray-500 mb-6">
              {isOwnProfile 
                ? 'Add your first dress to start renting out your wardrobe'
                : 'This user hasn\'t added any dresses yet'
              }
            </p>
            {isOwnProfile && (
              <Link to={createPageUrl("AddDress")}>
                <Button className="bg-rose-600 hover:bg-rose-700">
                  Add Your First Dress
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="dresses">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 gap-4"
                >
                  {dresses.map((dress, index) => (
                    <Draggable key={dress.id} draggableId={dress.id} index={index} isDragDisabled={!isOwnProfile}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-rose-100 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <div className="relative">
                            {/* Overlay div for lightbox click, placed below interactive elements */}
                            <div className="absolute inset-0 z-0" onClick={() => dress.images?.length > 0 && openLightbox(dress.images, 0)} />

                            {dress.images && dress.images.length > 0 ? (
                              <img 
                                src={dress.images[0]} 
                                alt={dress.name}
                                className="w-full h-48 object-cover" // Removed cursor-pointer from img
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">No image</span>
                              </div>
                            )}
                            
                            {dress.images && dress.images.length > 1 && (
                              <div className="absolute top-2 left-2 z-10">
                                  <Badge className="bg-black/60 text-white flex items-center gap-1">
                                    <Images className="w-3 h-3" />
                                    {dress.images.length}
                                  </Badge>
                              </div>
                            )}

                            {!dress.is_available && (
                              <div className="absolute top-2 right-2 z-10">
                                <Badge className="bg-red-500 text-white">Rented</Badge>
                              </div>
                            )}

                            {isOwnProfile && (
                                <div className="absolute top-2 right-2 p-1 text-white bg-black/30 rounded-md cursor-grab z-20"> {/* Higher z-index for drag handle if it overlaps with rented badge */}
                                    <GripVertical className="w-4 h-4" />
                                </div>
                            )}

                            {isOwnProfile && (
                              <div className="absolute bottom-2 right-2 flex gap-1 z-10">
                                <Button size="icon" variant="outline" className="h-8 w-8 bg-white/80 rounded-full" onClick={() => navigate(createPageUrl(`EditDress?dressId=${dress.id}`))}>
                                  <Edit className="w-4 h-4 text-gray-600" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="outline" className="h-8 w-8 bg-white/80 rounded-full">
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete your dress. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(dress.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3">
                            <div className="flex items-start justify-between mb-1"> {/* Changed to items-start */}
                              <h4 className="font-medium text-gray-900 text-sm truncate pr-2"> {/* Added pr-2 */}
                                {dress.name}
                              </h4>
                              <Badge variant="outline" className="text-xs shrink-0"> {/* Added shrink-0 */}
                                {dress.size}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-rose-600 font-bold">
                                ₪{dress.price_per_day}/day
                              </p>
                              {dress.originalPrice && ( // Added originalPrice display
                                <p className="text-xs text-gray-500 line-through">
                                  ₪{dress.originalPrice}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </>
  );
}
