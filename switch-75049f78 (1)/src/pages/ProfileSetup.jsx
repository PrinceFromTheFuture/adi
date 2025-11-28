
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Camera, Save, User as UserIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTranslation } from "@/components/common/LanguageProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const countries = [
  { code: 'IL', name: 'Israel' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'AR', name: 'Argentina' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'TR', name: 'Turkey' },
  { code: 'GR', name: 'Greece' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PT', name: 'Portugal' },
  { code: 'BE', name: 'Belgium' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'IE', name: 'Ireland' },
  { code: 'RU', name: 'Russia' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
];

const countryPhoneCodes = {
    'Israel': '972', 'United States': '1', 'United Kingdom': '44', 'France': '33', 'Germany': '49', 'Canada': '1', 'Australia': '61', 'New Zealand': '64', 'Argentina': '54', 'Brazil': '55', 'Mexico': '52', 'Chile': '56', 'Colombia': '57', 'Peru': '51', 'South Africa': '27', 'Egypt': '20', 'United Arab Emirates': '971', 'Saudi Arabia': '966', 'Qatar': '974', 'Kuwait': '965', 'Bahrain': '973', 'Turkey': '90', 'Greece': '30', 'Italy': '39', 'Spain': '34', 'Portugal': '351', 'Belgium': '32', 'Netherlands': '31', 'Sweden': '46', 'Norway': '47', 'Denmark': '45', 'Finland': '358', 'Switzerland': '41', 'Austria': '43', 'Ireland': '353', 'Russia': '7', 'Poland': '48', 'Czech Republic': '420', 'Hungary': '36', 'Romania': '40', 'Ukraine': '380', 'China': '86', 'India': '91', 'Japan': '81', 'South Korea': '82', 'Singapore': '65', 'Malaysia': '60', 'Thailand': '66', 'Indonesia': '62', 'Philippines': '63', 'Vietnam': '84'
};


const currencies = [
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' }
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    country: "",
    city: "",
    instagram_handle: "",
    phone_number: "", // This will now be constructed on submit
    contact_email: "",
    profile_image: "",
    currency: "ILS"
  });
  const [nationalPhoneNumber, setNationalPhoneNumber] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setAuthUser(currentUser);
        setFormData(prev => ({
          ...prev,
          full_name: currentUser.full_name || "",
          contact_email: currentUser.email || ""
        }));
        // If a country is already set for the user, try to set the phone country code
        if (currentUser.country && countryPhoneCodes[currentUser.country]) {
          setPhoneCountryCode(countryPhoneCodes[currentUser.country]);
        }
        // If an international phone number exists, we'd need more complex logic to parse it
        // into nationalPhoneNumber and phoneCountryCode if we wanted to pre-fill it.
        // For simplicity, we'll leave nationalPhoneNumber empty for now.
      } catch (error) {
        console.error("Failed to fetch auth user data", error);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'country' && countryPhoneCodes[value]) {
        setPhoneCountryCode(countryPhoneCodes[value]);
    } else if (field === 'country') {
        setPhoneCountryCode(''); // Clear if country doesn't have a known code
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_image: file_url }));
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
    setIsUploading(false);
  };

  const hasContactMethod = () => {
    // Check if at least one contact method is provided, including the new phone number fields
    return formData.instagram_handle || (nationalPhoneNumber && phoneCountryCode) || formData.contact_email;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      alert(t("Please enter your full name."));
      return;
    }
    
    if (!formData.country.trim()) {
      alert(t("Please select your country."));
      return;
    }

    if (!formData.city.trim()) {
      alert(t("Please enter your pickup city."));
      return;
    }
    
    if (!hasContactMethod()) {
      alert(t("Please provide at least one contact method (Instagram, WhatsApp, or Email)."));
      return;
    }
    
    setIsLoading(true);
    try {
      // Construct the full phone number from nationalPhoneNumber and phoneCountryCode
      const fullPhoneNumber = nationalPhoneNumber && phoneCountryCode 
        ? `+${phoneCountryCode}${nationalPhoneNumber.replace(/\D/g, '')}` 
        : '';
        
      // Create the member profile with all form data
      await Member.create({
        user_id: authUser.id,
        full_name: formData.full_name,
        bio: formData.bio,
        profile_image: formData.profile_image,
        country: formData.country,
        city: formData.city,
        instagram_handle: formData.instagram_handle,
        phone_number: fullPhoneNumber, // Use the constructed phone number
        contact_email: formData.contact_email,
        currency: formData.currency,
        following_count: 0,
        followers_count: 0
      });
      
      setShowSuccess(true);
      
      setTimeout(() => {
        window.location.href = createPageUrl("Home");
      }, 2000);

    } catch (error) {
      console.error("Error creating member profile:", error);
      alert(t("Failed to save profile. Please try again."));
    }
    setIsLoading(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Profile Saved Successfully!')}</h2>
          <p className="text-gray-600 mb-4">{t('Welcome to Switch! You can now start exploring and sharing dresses.')}</p>
          <div className="animate-pulse text-rose-600">{t('Redirecting to home...')}</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <div className="bg-white/80 backdrop-blur-lg border-b border-rose-100">
        <div className="px-4 py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('Complete Your Profile')}</h1>
          <p className="text-gray-600">{t("Let's set up your profile to get started with Switch")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-28 mb-4">
            <div className="w-full h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
              {formData.profile_image ? (
                <img 
                  src={formData.profile_image} 
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-white" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-700">
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">{t('Add a profile photo (optional)')}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Basic Information')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Full Name *')}
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder={t('Your full name')}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Country *')}</label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select a country')} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Pickup City *')}
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder={t('e.g., Tel Aviv, Jerusalem, Haifa')}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{t('Where will people pick up dresses from you?')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Currency *')}
                </label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select currency')} />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('About You (Optional)')}
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder={t('Tell others a little about yourself and your style...')}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Contact Methods')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('Choose at least one way for people to contact you about rentals')}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Instagram Handle')}
                </label>
                <Input
                  value={formData.instagram_handle}
                  onChange={(e) => handleInputChange("instagram_handle", e.target.value.replace('@', ''))}
                  placeholder={t('your_username')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('WhatsApp Number')}
                </label>
                <div className="flex gap-2">
                    <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="+ Code" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(countryPhoneCodes).map(([country, code]) => (
                                <SelectItem key={code} value={code}>
                                    +{code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      value={nationalPhoneNumber}
                      onChange={(e) => setNationalPhoneNumber(e.target.value)}
                      placeholder={t('Your number')}
                      className="flex-1"
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Email Address')}
                </label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  placeholder={t('your.email@example.com')}
                />
              </div>
            </div>
            
            {!hasContactMethod() && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {t('Please provide at least one contact method so others can reach you.')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white me-2" />
                {t('Saving Profile...')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 me-2" />
                {t('Save Profile & Continue')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
