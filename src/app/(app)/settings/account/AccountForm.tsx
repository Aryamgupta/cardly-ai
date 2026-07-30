"use client";

import { useState, useRef } from "react";
import { updateProfile } from "@/app/actions/settings";
import { Loader2, Save, Upload, Camera } from "lucide-react";
import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountProfileSchema } from "@/lib/validations";
import { z } from "zod";

interface AccountFormProps {
  userId: string;
  initialName: string;
  initialJobTitle?: string;
  initialEmail: string;
  initialAvatarUrl: string;
}

type AccountFormValues = z.infer<typeof accountProfileSchema>;

export function AccountForm({ userId, initialName, initialJobTitle = "", initialEmail, initialAvatarUrl }: AccountFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      full_name: initialName,
      job_title: initialJobTitle,
    }
  });

  const currentName = watch("full_name") || "User";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      
      // Auto-save the new avatar URL with current form values
      const currentValues = watch();
      await updateProfile(currentValues.full_name, publicUrl, currentValues.job_title || "");
      
      toast.custom((t) => (
        <CustomToast 
          id={t}
          variant="success"
          title="Profile Picture Updated"
          description="Your new avatar has been saved."
        />
      ));

    } catch (error: any) {
      console.error("Upload error:", error);
      toast.custom((t) => (
        <CustomToast 
          id={t}
          variant="error"
          title="Upload Failed"
          description={error.message || "Could not upload image. Make sure the avatars bucket exists."}
        />
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: AccountFormValues) => {
    setIsSaving(true);
    try {
      await updateProfile(data.full_name, avatarUrl, data.job_title || "");
      toast.custom((t) => (
        <CustomToast 
          id={t}
          variant="success"
          title="Profile Saved"
          description="Your account preferences have been updated."
        />
      ));
    } catch (error) {
      toast.custom((t) => (
        <CustomToast 
          id={t}
          variant="error"
          title="Update Failed"
          description="Failed to save profile. Please try again."
        />
      ));
    } finally {
      setIsSaving(false);
    }
  };

  const displayAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentName)}&background=random`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
          <p className="text-sm text-muted-foreground mt-1">Update your photo and personal details.</p>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-slate-100 flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-1">Profile Photo</h3>
              <p className="text-sm text-muted-foreground mb-3">Recommended: Square JPG, PNG. Max 5MB.</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? "Uploading..." : "Upload New Photo"}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input
                type="text"
                {...register("full_name")}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.full_name ? 'border-red-500' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                placeholder="Your Name"
              />
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1.5">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Job Title</label>
              <input
                type="text"
                {...register("job_title")}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.job_title ? 'border-red-500' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                placeholder="e.g. Senior Product Strategist"
              />
              {errors.job_title && (
                <p className="text-red-500 text-xs mt-1.5">{errors.job_title.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                value={initialEmail}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Email address cannot be changed currently.</p>
            </div>
          </div>

        </div>
        
        <div className="p-4 bg-slate-50 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isSaving || isUploading || (!isDirty && avatarUrl === initialAvatarUrl)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </form>
  );
}
