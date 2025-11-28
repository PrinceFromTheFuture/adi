
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { ArrowLeft, Camera, Save, User as UserIcon, AlertCircle } from "lucide-react";
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
  { code: 'NZ', name: 'New Zealand' }
];

const countryPhoneCodes = {
    'Israel': '972', 'United States': '1', 'United Kingdom': '44', 'France': '33', 'Germany': '49', 'Canada': '1', 'Australia': '61', 'New Zealand': '64', 'Argentina': '54', 'Brazil': '55', 'Mexico': '52', 'Chile': '56', 'Colombia': '57', 'Peru': '51', 'South Africa': '27', 'Egypt': '20', 'United Arab Emirates': '971', 'Saudi Arabia': '966', 'Qatar': '974', 'Kuwait': '965', 'Bahrain': '973', 'Turkey': '90', 'Greece': '30', 'Italy': '39', 'Spain': '34', 'Portugal': '351', 'Belgium': '32', 'Netherlands': '31', 'Sweden': '46', 'Norway': '47', 'Denmark': '45', 'Finland': '358', 'Switzerland': '41', 'Austria': '43', 'Ireland': '353', 'Russia': '7', 'Poland': '48', 'Czech Republic': '420', 'Hungary': '36', 'Romania': '40', 'Ukraine': '380', 'China': '86', 'India': '91', 'Japan': '81', 'South Korea': '82', 'Singapore': '65', 'Malaysia': '60', 'Thailand': '66', 'Indonesia': '62', 'Philippines': '63', 'Vietnam': '84'
};

const currencies = [
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' }
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [nationalPhoneNumber, setNationalPhoneNumber] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        const members = await Member.filter({ user_id: currentUser.id });
        if (members.length > 0) {
          const fetchedMember = members[0];
          setMember({
            ...fetchedMember,
            // Ensure all fields have default values
            full_name: fetchedMember.full_name || "",
            bio: fetchedMember.bio || "",
            profile_image: fetchedMember.profile_image || "",
            country: fetchedMember.country || "",
            city: fetchedMember.city || "",
            instagram_handle: fetchedMember.instagram_handle || "",
            phone_number: fetchedMember.phone_number || "",
            contact_email: fetchedMember.contact_email || "",
            currency: fetchedMember.currency || "ILS"
          });
          
          const code = countryPhoneCodes[fetchedMember.country] || '';
          setPhoneCountryCode(code);
          if (fetchedMember.phone_number && fetchedMember.phone_number.startsWith(`+${code}`)) {
              const national = fetchedMember.phone_number.replace(`+${code}`, '');
              setNationalPhoneNumber(national);
          } else {
              setNationalPhoneNumber(fetchedMember.phone_number || ''); // Fallback if no country code or mismatch
          }

        } else {
           navigate(createPageUrl("ProfileSetup"));
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
        navigate(createPageUrl("Home"));
      }
    };
    fetchUser();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setMember(prev => ({ ...prev, [field]: value }));
    if (field === 'country' && countryPhoneCodes[value]) {
        setPhoneCountryCode(countryPhoneCodes[value]);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setMember(prev => ({ ...prev, profile_image: file_url }));
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!member.city) {
      setError(t("Pickup City is required."));
      return;
    }
    if (!member.country) {
      setError(t("Please select your country."));
      return;
    }
    
    setIsLoading(true);
    try {
      const fullPhoneNumber = nationalPhoneNumber && phoneCountryCode
        ? `+${phoneCountryCode}${nationalPhoneNumber.replace(/\D/g, '')}`
        : '';
        
      // Only send the fields that can be updated
      const updateData = {
        full_name: member.full_name,
        bio: member.bio,
        profile_image: member.profile_image,
        country: member.country,
        city: member.city,
        instagram_handle: member.instagram_handle,
        phone_number: fullPhoneNumber,
        contact_email: member.contact_email,
        currency: member.currency
      };
      
      await Member.update(member.id, updateData);
      
      localStorage.setItem('profile-update-message', t('Profile updated successfully!'));
      
      navigate(createPageUrl("Profile"));
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(t("Failed to update profile. Please try again."));
    }
    setIsLoading(false);
  };

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
      </div>
    );
  }

  return (
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
          <h1 className="text-xl font-semibold text-gray-900">{t('Edit Profile')}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            <Save className="w-5 h-5 text-rose-600" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pb-24">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-28 mb-4">
            <div className="w-full h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
              {member.profile_image ? (
                <img 
                  src={member.profile_image} 
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
          <h2 className="text-2xl font-bold text-gray-900">{member.full_name}</h2>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Public Info')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Full Name')}</label>
                <Input
                  value={member.full_name || ""}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder={t('Your full name')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Bio')}</label>
                <Textarea
                  value={member.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder={t('Tell others a little about yourself')}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Country *')}</label>
                <Select value={member.country || ""} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select a country')} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Pickup City *')}</label>
                <Input
                  value={member.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder={t('e.g., Tel Aviv')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Currency')}</label>
                <Select value={member.currency || "ILS"} onValueChange={(value) => handleInputChange("currency", value)}>
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
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Contact Methods')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Instagram Handle')}</label>
                <Input
                  value={member.instagram_handle || ""}
                  onChange={(e) => handleInputChange("instagram_handle", e.target.value.replace('@', ''))}
                  placeholder={t('your_username')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('WhatsApp Number')}</label>
                <div className="flex gap-2">
                    <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder={t('+ Code')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(countryPhoneCodes).map(([country, code]) => (
                                <SelectItem key={code} value={code}>
                                    +{code} ({country})
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
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Contact Email')}</label>
                <Input
                  type="email"
                  value={member.contact_email || ""}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  placeholder={t('your.email@example.com')}
                />
              </div>
            </div>
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
                {t('Saving Changes...')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5 me-2" />
                {t('Save Changes')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
