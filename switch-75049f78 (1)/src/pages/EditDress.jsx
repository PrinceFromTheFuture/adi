import React, { useState, useEffect } from "react";
import { Dress } from "@/api/entities";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { ArrowLeft, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ImageLightbox from "../components/common/ImageLightbox";
import { useTranslation } from "@/components/common/LanguageProvider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const getCurrencySymbol = (currency) => {
  const symbols = {
    'ILS': '₪',
    'USD': '$',
    'EUR': '€'
  };
  return symbols[currency] || '₪';
};

export default function EditDress() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userCurrency, setUserCurrency] = useState('ILS');
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_day: "",
    originalPrice: "",
    size: "",
    color: "",
    category: "",
    brand: "",
    images: []
  });

  const urlParams = new URLSearchParams(window.location.search);
  const dressId = urlParams.get('dressId');

  useEffect(() => {
    if (!dressId) {
      navigate(createPageUrl("Profile"));
      return;
    }

    const fetchDressAndUser = async () => {
      try {
        const [dressData] = await Dress.filter({id: dressId});
        const user = await User.me();
        
        if (!dressData || dressData.owner_id !== user.id) {
          navigate(createPageUrl("Profile"));
          return;
        }

        const members = await Member.filter({ user_id: user.id });
        if (members.length > 0) {
          setUserCurrency(members[0].currency || 'ILS');
        }

        setFormData({
          name: dressData.name || "",
          description: dressData.description || "",
          price_per_day: dressData.price_per_day || "",
          originalPrice: dressData.originalPrice || "",
          size: dressData.size || "",
          color: dressData.color || "",
          category: dressData.category || "",
          brand: dressData.brand || "",
          images: dressData.images || []
        });

      } catch (error) {
        console.error("Error fetching dress data:", error);
        navigate(createPageUrl("Profile"));
      }
      setPageLoading(false);
    };
    
    fetchDressAndUser();
  }, [dressId, navigate]);

  const openLightbox = (index) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await UploadFile({ file });
        return result.file_url;
      });
      
      const imageUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
    }
    setUploadingImages(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await Dress.update(dressId, {
        ...formData,
        price_per_day: parseFloat(formData.price_per_day),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      });
      navigate(createPageUrl("Profile"));
    } catch (error) {
      console.error("Error updating dress:", error);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        await Dress.delete(dressId);
        navigate(createPageUrl("Profile"));
    } catch(e) {
        console.error("Failed to delete dress", e);
        setIsDeleting(false);
    }
  }

  if (pageLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
        </div>
    );
  }

  return (
    <>
      <ImageLightbox
        images={formData.images}
        startIndex={selectedImageIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        <div className="bg-white/80 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Profile"))}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">{t('Edit Dress')}</h1>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                  <Trash2 className="w-5 h-5" />
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
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 pb-24">
           <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Photos')}</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <button type="button" onClick={() => openLightbox(index)} className="w-full">
                    <img 
                      src={image} 
                      alt={`Dress ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {formData.images.length < 5 && (
                <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 transition-colors">
                  {uploadingImages ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">{t('Add Photo')}</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              {t('Add up to 5 photos. The first photo will be the cover image.')}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Dress Details')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Dress Name *')}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t('e.g., Black Evening Gown')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Description')}
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder={t('Describe the dress, occasion, fit, etc.')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Size *')}
                  </label>
                  <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select size')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Rental Price/Day *')}
                  </label>
                  <div className="relative">
                    <span className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {getCurrencySymbol(userCurrency)}
                    </span>
                    <Input
                      type="number"
                      value={formData.price_per_day}
                      onChange={(e) => handleInputChange("price_per_day", e.target.value)}
                      placeholder="100"
                      className="ps-8"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('Original Price (Optional)')}
                    </label>
                    <div className="relative">
                        <span className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {getCurrencySymbol(userCurrency)}
                        </span>
                        <Input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                        placeholder="500"
                        className="ps-8"
                        min="1"
                        />
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Category')}
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evening">{t('Evening')}</SelectItem>
                      <SelectItem value="cocktail">{t('Cocktail')}</SelectItem>
                      <SelectItem value="casual">{t('Casual')}</SelectItem>
                      <SelectItem value="formal">{t('Formal')}</SelectItem>
                      <SelectItem value="wedding_guest">{t('Wedding Guest')}</SelectItem>
                      <SelectItem value="party">{t('Party')}</SelectItem>
                      <SelectItem value="work">{t('Work')}</SelectItem>
                      <SelectItem value="other">{t('Other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Color')}
                  </label>
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    placeholder={t('e.g., Black, Navy')}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Brand')}
                  </label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder={t('e.g., Zara, H&M')}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.name || !formData.size || !formData.price_per_day}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl text-lg font-medium"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white me-2" />
                {t('Saving Changes...')}
              </>
            ) : (
              t('Save Changes')
            )}
          </Button>
        </form>
      </div>
    </>
  );
}