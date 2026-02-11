'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Upload,
  X,
  Star,
  Globe,
  MapPin,
  Phone,
  Instagram,
  Link as LinkIcon,
  Tag,
  ChevronDown,
} from 'lucide-react';
import {
  venueSchema,
  generateSlug,
  CITIES,
  CATEGORIES,
  PRICE_RANGES,
  VENUE_STATUSES,
  CITY_LABELS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  type VenueFormData,
  type VenueContent,
  type VenuePhoto,
} from '@/lib/validations/venue';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface VenueFormProps {
  initialData?: Partial<VenueFormData> & { id?: string };
  mode: 'create' | 'edit';
}

type TabKey = 'basic' | 'location' | 'contact' | 'details' | 'content' | 'photos' | 'settings';

interface FormTab {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const FORM_TABS: FormTab[] = [
  { key: 'basic', label: 'Basic Info', icon: Info },
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'contact', label: 'Contact', icon: Phone },
  { key: 'details', label: 'Details', icon: Tag },
  { key: 'content', label: 'Content', icon: Globe },
  { key: 'photos', label: 'Photos', icon: ImageIcon },
  { key: 'settings', label: 'Settings', icon: Star },
];

const DEFAULT_CONTENT_FR: VenueContent = {
  locale: 'fr',
  description: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: [],
};

const DEFAULT_CONTENT_EN: VenueContent = {
  locale: 'en',
  description: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: [],
};

// ──────────────────────────────────────────────
// VenueForm Component
// ──────────────────────────────────────────────

export default function VenueForm({ initialData, mode }: VenueFormProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  // ── Form state ──
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [contentLocale, setContentLocale] = useState<'fr' | 'en'>('fr');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Field state ──
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [city, setCity] = useState(initialData?.city || '');
  const [category, setCategory] = useState(initialData?.category || '');

  const [address, setAddress] = useState(initialData?.address || '');
  const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood || '');
  const [latitude, setLatitude] = useState<string>(
    initialData?.latitude != null ? String(initialData.latitude) : ''
  );
  const [longitude, setLongitude] = useState<string>(
    initialData?.longitude != null ? String(initialData.longitude) : ''
  );

  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [instagram, setInstagram] = useState(initialData?.instagram || '');
  const [website, setWebsite] = useState(initialData?.website || '');

  const [priceRange, setPriceRange] = useState(initialData?.price_range || '');
  const [dressCode, setDressCode] = useState(initialData?.dress_code || '');
  const [musicStyle, setMusicStyle] = useState(initialData?.music_style || '');
  const [agePolicy, setAgePolicy] = useState(initialData?.age_policy || '');
  const [alcoholPolicy, setAlcoholPolicy] = useState(initialData?.alcohol_policy || '');

  const [attributes, setAttributes] = useState<Array<{ key: string; value: string }>>(
    initialData?.attributes
      ? Object.entries(initialData.attributes).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : []
  );

  const [tagIds, setTagIds] = useState<string[]>(initialData?.tag_ids || []);

  // Content for FR and EN
  const initFr = initialData?.contents?.find((c) => c.locale === 'fr') || DEFAULT_CONTENT_FR;
  const initEn = initialData?.contents?.find((c) => c.locale === 'en') || DEFAULT_CONTENT_EN;

  const [contentFr, setContentFr] = useState<VenueContent>({ ...DEFAULT_CONTENT_FR, ...initFr });
  const [contentEn, setContentEn] = useState<VenueContent>({ ...DEFAULT_CONTENT_EN, ...initEn });
  const [seoKeywordInputFr, setSeoKeywordInputFr] = useState('');
  const [seoKeywordInputEn, setSeoKeywordInputEn] = useState('');

  // Photos
  const [photos, setPhotos] = useState<VenuePhoto[]>(initialData?.photos || []);

  // Settings
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [priorityScore, setPriorityScore] = useState(initialData?.priority_score ?? 0);
  const [isSponsored, setIsSponsored] = useState(initialData?.is_sponsored || false);
  const [internalNotes, setInternalNotes] = useState(initialData?.internal_notes || '');

  // ── Auto-generate slug from name ──
  useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlug(generateSlug(name));
    }
  }, [name, slugManuallyEdited]);

  // ── Toast auto-dismiss ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ── Build form data ──
  const buildFormData = useCallback((): VenueFormData => {
    const contents: VenueContent[] = [];
    if (contentFr.description.trim()) contents.push(contentFr);
    if (contentEn.description.trim()) contents.push(contentEn);
    // Ensure at least FR content exists
    if (contents.length === 0) contents.push(contentFr);

    const attributesObj: Record<string, string | number | boolean> = {};
    attributes.forEach(({ key, value }) => {
      if (key.trim()) {
        attributesObj[key.trim()] = value;
      }
    });

    return {
      name,
      slug,
      city: city as VenueFormData['city'],
      category: category as VenueFormData['category'],
      address,
      neighborhood,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      whatsapp,
      phone,
      instagram,
      website,
      price_range: (priceRange || null) as VenueFormData['price_range'],
      dress_code: dressCode,
      music_style: musicStyle,
      age_policy: agePolicy,
      alcohol_policy: alcoholPolicy,
      attributes: attributesObj,
      tag_ids: tagIds,
      contents,
      photos,
      status: status as VenueFormData['status'],
      priority_score: priorityScore,
      is_sponsored: isSponsored,
      internal_notes: internalNotes,
    };
  }, [
    name, slug, city, category, address, neighborhood, latitude, longitude,
    whatsapp, phone, instagram, website, priceRange, dressCode, musicStyle,
    agePolicy, alcoholPolicy, attributes, tagIds, contentFr, contentEn,
    photos, status, priorityScore, isSponsored, internalNotes,
  ]);

  // ── Validate and submit ──
  const handleSubmit = useCallback(
    async (submitStatus?: 'draft' | 'published') => {
      setErrors({});
      setIsSubmitting(true);

      const formData = buildFormData();
      if (submitStatus) {
        formData.status = submitStatus;
      }

      // Validate with Zod
      const result = venueSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        setToast({ type: 'error', message: 'Please fix the validation errors' });
        setIsSubmitting(false);

        // Switch to the tab containing the first error
        const firstErrorPath = result.error.issues[0]?.path[0];
        if (firstErrorPath) {
          const tabMap: Record<string, TabKey> = {
            name: 'basic', slug: 'basic', city: 'basic', category: 'basic',
            address: 'location', neighborhood: 'location', latitude: 'location', longitude: 'location',
            whatsapp: 'contact', phone: 'contact', instagram: 'contact', website: 'contact',
            price_range: 'details', dress_code: 'details', music_style: 'details',
            age_policy: 'details', alcohol_policy: 'details', attributes: 'details',
            contents: 'content', tag_ids: 'content',
            photos: 'photos',
            status: 'settings', priority_score: 'settings', is_sponsored: 'settings',
          };
          const targetTab = tabMap[String(firstErrorPath)];
          if (targetTab) setActiveTab(targetTab);
        }
        return;
      }

      try {
        const url =
          mode === 'create'
            ? '/api/admin/venues'
            : `/api/admin/venues/${initialData?.id}`;

        const method = mode === 'create' ? 'POST' : 'PUT';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data),
        });

        const data = await res.json();

        if (res.ok) {
          setToast({
            type: 'success',
            message: mode === 'create' ? 'Venue created successfully!' : 'Venue updated successfully!',
          });
          setTimeout(() => {
            router.push(`/${locale}/admin/venues`);
            router.refresh();
          }, 1000);
        } else {
          setToast({ type: 'error', message: data.error || 'Failed to save venue' });
        }
      } catch {
        setToast({ type: 'error', message: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [buildFormData, mode, initialData?.id, router, locale]
  );

  // ── Current content helpers ──
  const currentContent = contentLocale === 'fr' ? contentFr : contentEn;
  const setCurrentContent = contentLocale === 'fr' ? setContentFr : setContentEn;
  const currentKeywordInput = contentLocale === 'fr' ? seoKeywordInputFr : seoKeywordInputEn;
  const setCurrentKeywordInput = contentLocale === 'fr' ? setSeoKeywordInputFr : setSeoKeywordInputEn;

  // ── SEO keyword handlers ──
  const addKeyword = useCallback(() => {
    const keyword = currentKeywordInput.trim();
    if (!keyword) return;
    if (currentContent.seo_keywords && currentContent.seo_keywords.length >= 20) return;
    if (currentContent.seo_keywords?.includes(keyword)) return;

    setCurrentContent((prev) => ({
      ...prev,
      seo_keywords: [...(prev.seo_keywords || []), keyword],
    }));
    setCurrentKeywordInput('');
  }, [currentKeywordInput, currentContent, setCurrentContent, setCurrentKeywordInput]);

  const removeKeyword = useCallback(
    (keyword: string) => {
      setCurrentContent((prev) => ({
        ...prev,
        seo_keywords: (prev.seo_keywords || []).filter((k) => k !== keyword),
      }));
    },
    [setCurrentContent]
  );

  // ── Attribute handlers ──
  const addAttribute = useCallback(() => {
    setAttributes((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const removeAttribute = useCallback((index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateAttribute = useCallback((index: number, field: 'key' | 'value', val: string) => {
    setAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: val } : attr))
    );
  }, []);

  // ── Photo handlers ──
  const addPhotoUrl = useCallback(() => {
    setPhotos((prev) => [
      ...prev,
      {
        url: '',
        alt: '',
        is_cover: prev.length === 0,
        sort_order: prev.length,
      },
    ]);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // If we removed the cover, make the first photo the cover
      if (next.length > 0 && !next.some((p) => p.is_cover)) {
        next[0] = { ...next[0], is_cover: true };
      }
      return next.map((p, i) => ({ ...p, sort_order: i }));
    });
  }, []);

  const updatePhoto = useCallback((index: number, field: keyof VenuePhoto, val: string | boolean | number) => {
    setPhotos((prev) =>
      prev.map((photo, i) => {
        if (i === index) {
          return { ...photo, [field]: val };
        }
        // If setting cover, unset others
        if (field === 'is_cover' && val === true) {
          return { ...photo, is_cover: false };
        }
        return photo;
      })
    );
  }, []);

  const movePhoto = useCallback((index: number, direction: 'up' | 'down') => {
    setPhotos((prev) => {
      const next = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next.map((p, i) => ({ ...p, sort_order: i }));
    });
  }, []);

  // ── Error helper ──
  const fieldError = useCallback(
    (path: string) => errors[path],
    [errors]
  );

  // ── Available mock tags ──
  const availableTags = useMemo(
    () => [
      { id: 'tag-1', name: 'VIP Experience' },
      { id: 'tag-2', name: 'Live DJ' },
      { id: 'tag-3', name: 'Outdoor Terrace' },
      { id: 'tag-4', name: 'Ocean View' },
      { id: 'tag-5', name: 'Pool Area' },
      { id: 'tag-6', name: 'Fine Dining' },
      { id: 'tag-7', name: 'Cocktail Bar' },
      { id: 'tag-8', name: 'Shisha' },
      { id: 'tag-9', name: 'Ladies Night' },
      { id: 'tag-10', name: 'Bottle Service' },
      { id: 'tag-11', name: 'Late Night' },
      { id: 'tag-12', name: 'Brunch' },
    ],
    []
  );

  // ──────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg
            ${
              toast.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : toast.type === 'error'
                ? 'border-red-500/20 bg-red-500/10 text-red-400'
                : 'border-blue-500/20 bg-blue-500/10 text-blue-400'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded p-0.5 hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {mode === 'create' ? 'Add New Venue' : `Edit: ${initialData?.name || 'Venue'}`}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'create'
              ? 'Fill in the details to create a new venue listing'
              : 'Update the venue information below'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5
              text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5
              text-sm font-semibold text-gray-950 hover:bg-[#E5C349]
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publish
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-gray-800 bg-gray-900 p-1">
        {FORM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          // Check if tab has errors
          const tabHasErrors = Object.keys(errors).some((errPath) => {
            const tabMap: Record<string, string[]> = {
              basic: ['name', 'slug', 'city', 'category'],
              location: ['address', 'neighborhood', 'latitude', 'longitude'],
              contact: ['whatsapp', 'phone', 'instagram', 'website'],
              details: ['price_range', 'dress_code', 'music_style', 'age_policy', 'alcohol_policy'],
              content: ['contents'],
              photos: ['photos'],
              settings: ['status', 'priority_score'],
            };
            return tabMap[tab.key]?.some((field) => errPath.startsWith(field));
          });

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tabHasErrors && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        {/* ── BASIC INFO TAB ── */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <SectionTitle>Basic Information</SectionTitle>

            {/* Name */}
            <FormField label="Venue Name" required error={fieldError('name')}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sky Bar Casablanca"
                className={inputClass(fieldError('name'))}
              />
            </FormField>

            {/* Slug */}
            <FormField
              label="URL Slug"
              required
              error={fieldError('slug')}
              hint="Auto-generated from name. Edit manually if needed."
            >
              <div className="flex gap-2">
                <div className="flex flex-1 items-center rounded-lg border border-gray-700 bg-gray-800">
                  <span className="px-3 text-sm text-gray-500">/venues/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                {slugManuallyEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlug(generateSlug(name));
                      setSlugManuallyEdited(false);
                    }}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-400 hover:text-white"
                  >
                    Reset
                  </button>
                )}
              </div>
            </FormField>

            {/* City & Category */}
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="City" required error={fieldError('city')}>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={selectClass(fieldError('city'))}
                  >
                    <option value="">Select a city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {CITY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </FormField>

              <FormField label="Category" required error={fieldError('category')}>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={selectClass(fieldError('category'))}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </FormField>
            </div>
          </div>
        )}

        {/* ── LOCATION TAB ── */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <SectionTitle>Location Details</SectionTitle>

            <FormField label="Street Address" required error={fieldError('address')}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Boulevard de la Corniche"
                className={inputClass(fieldError('address'))}
              />
            </FormField>

            <FormField label="Neighborhood" error={fieldError('neighborhood')}>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="e.g., Ain Diab, Gueliz, Kasbah"
                className={inputClass(fieldError('neighborhood'))}
              />
            </FormField>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Latitude" error={fieldError('latitude')}>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="33.5731"
                  className={inputClass(fieldError('latitude'))}
                />
              </FormField>

              <FormField label="Longitude" error={fieldError('longitude')}>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-7.5898"
                  className={inputClass(fieldError('longitude'))}
                />
              </FormField>
            </div>

            {/* Map Picker Placeholder */}
            <div className="rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-3 text-sm font-medium text-gray-400">
                Interactive Map Picker
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Map integration coming soon. Enter coordinates manually for now.
              </p>
            </div>
          </div>
        )}

        {/* ── CONTACT TAB ── */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <SectionTitle>Contact Information</SectionTitle>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="WhatsApp" error={fieldError('whatsapp')} icon={Phone}>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  className={inputClass(fieldError('whatsapp'))}
                />
              </FormField>

              <FormField label="Phone" error={fieldError('phone')} icon={Phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 5XX XXX XXX"
                  className={inputClass(fieldError('phone'))}
                />
              </FormField>

              <FormField label="Instagram Handle" error={fieldError('instagram')} icon={Instagram}>
                <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800">
                  <span className="px-3 text-sm text-gray-500">@</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="venue_handle"
                    className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </FormField>

              <FormField label="Website" error={fieldError('website')} icon={LinkIcon}>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.example.com"
                  className={inputClass(fieldError('website'))}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* ── DETAILS TAB ── */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <SectionTitle>Venue Details</SectionTitle>

            {/* Price Range Radio */}
            <FormField label="Price Range" error={fieldError('price_range')}>
              <div className="flex gap-3">
                {PRICE_RANGES.map((pr) => (
                  <label
                    key={pr}
                    className={`
                      flex cursor-pointer items-center justify-center rounded-lg border px-5 py-2.5
                      text-sm font-medium transition-all
                      ${
                        priceRange === pr
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="price_range"
                      value={pr}
                      checked={priceRange === pr}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="sr-only"
                    />
                    {pr}
                  </label>
                ))}
                {priceRange && (
                  <button
                    type="button"
                    onClick={() => setPriceRange('')}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-500 hover:text-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </FormField>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Dress Code" error={fieldError('dress_code')}>
                <input
                  type="text"
                  value={dressCode}
                  onChange={(e) => setDressCode(e.target.value)}
                  placeholder="e.g., Smart Casual, Formal"
                  className={inputClass(fieldError('dress_code'))}
                />
              </FormField>

              <FormField label="Music Style" error={fieldError('music_style')}>
                <input
                  type="text"
                  value={musicStyle}
                  onChange={(e) => setMusicStyle(e.target.value)}
                  placeholder="e.g., House, R&B, Oriental, Afrobeats"
                  className={inputClass(fieldError('music_style'))}
                />
              </FormField>

              <FormField label="Age Policy" error={fieldError('age_policy')}>
                <input
                  type="text"
                  value={agePolicy}
                  onChange={(e) => setAgePolicy(e.target.value)}
                  placeholder="e.g., 21+, 18+ with ID"
                  className={inputClass(fieldError('age_policy'))}
                />
              </FormField>

              <FormField label="Alcohol Policy" error={fieldError('alcohol_policy')}>
                <input
                  type="text"
                  value={alcoholPolicy}
                  onChange={(e) => setAlcoholPolicy(e.target.value)}
                  placeholder="e.g., Full bar, Licensed, No alcohol"
                  className={inputClass(fieldError('alcohol_policy'))}
                />
              </FormField>
            </div>

            {/* Dynamic Attributes */}
            <div className="pt-4">
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle>Custom Attributes</SectionTitle>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Field
                </button>
              </div>
              <p className="mb-4 text-xs text-gray-600">
                Add custom key-value pairs for additional venue attributes (stored as JSONB).
              </p>

              {attributes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-700 bg-gray-800/30 py-6 text-center text-sm text-gray-500">
                  No custom attributes. Click &quot;Add Field&quot; to create one.
                </div>
              ) : (
                <div className="space-y-2">
                  {attributes.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={attr.key}
                        onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                        placeholder="Key (e.g., capacity)"
                        className="w-1/3 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4AF37]"
                      />
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                        placeholder="Value (e.g., 500)"
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttribute(idx)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="pt-4">
              <SectionTitle>Tags</SectionTitle>
              <p className="mb-4 text-xs text-gray-600">
                Select relevant tags for this venue.
              </p>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = tagIds.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className={`
                        flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium
                        transition-all duration-150
                        ${
                          isSelected
                            ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setTagIds((prev) =>
                            isSelected ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          );
                        }}
                        className="sr-only"
                      />
                      {isSelected && <CheckCircle className="h-3 w-3" />}
                      {tag.name}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENT TAB ── */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionTitle>Localized Content</SectionTitle>
              <div className="flex rounded-lg border border-gray-700 bg-gray-800 p-0.5">
                {(['fr', 'en'] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setContentLocale(loc)}
                    className={`
                      rounded-md px-4 py-1.5 text-sm font-medium transition-colors
                      ${
                        contentLocale === loc
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    {loc === 'fr' ? 'Francais' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            {fieldError('contents') && (
              <p className="text-sm text-red-400">{fieldError('contents')}</p>
            )}
            {fieldError('contents.0.description') && (
              <p className="text-sm text-red-400">{fieldError('contents.0.description')}</p>
            )}

            {/* Description */}
            <FormField
              label={`Description (${contentLocale.toUpperCase()})`}
              required
              error={fieldError(`contents.${contentLocale === 'fr' ? 0 : 1}.description`)}
            >
              <textarea
                value={currentContent.description}
                onChange={(e) =>
                  setCurrentContent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={8}
                placeholder={
                  contentLocale === 'fr'
                    ? 'Decrivez ce lieu en francais...'
                    : 'Describe this venue in English...'
                }
                className={`${inputClass(
                  fieldError(`contents.${contentLocale === 'fr' ? 0 : 1}.description`)
                )} resize-y min-h-[150px]`}
              />
              <p className="mt-1 text-xs text-gray-600">
                {currentContent.description.length} / 5000 characters
              </p>
            </FormField>

            {/* SEO Title */}
            <FormField label={`SEO Title (${contentLocale.toUpperCase()})`}>
              <input
                type="text"
                value={currentContent.seo_title || ''}
                onChange={(e) =>
                  setCurrentContent((prev) => ({
                    ...prev,
                    seo_title: e.target.value,
                  }))
                }
                placeholder="Page title for search engines"
                maxLength={70}
                className={inputClass()}
              />
              <p className="mt-1 text-xs text-gray-600">
                {(currentContent.seo_title || '').length} / 70 characters
              </p>
            </FormField>

            {/* SEO Description */}
            <FormField label={`SEO Description (${contentLocale.toUpperCase()})`}>
              <textarea
                value={currentContent.seo_description || ''}
                onChange={(e) =>
                  setCurrentContent((prev) => ({
                    ...prev,
                    seo_description: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Meta description for search engines"
                maxLength={160}
                className={`${inputClass()} resize-none`}
              />
              <p className="mt-1 text-xs text-gray-600">
                {(currentContent.seo_description || '').length} / 160 characters
              </p>
            </FormField>

            {/* SEO Keywords (tag input) */}
            <FormField label={`SEO Keywords (${contentLocale.toUpperCase()})`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentKeywordInput}
                  onChange={(e) => setCurrentKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Type a keyword and press Enter"
                  className={inputClass()}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Add
                </button>
              </div>
              {currentContent.seo_keywords && currentContent.seo_keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentContent.seo_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-300"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="rounded-full p-0.5 hover:bg-gray-700 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-600">
                {(currentContent.seo_keywords || []).length} / 20 keywords
              </p>
            </FormField>
          </div>
        )}

        {/* ── PHOTOS TAB ── */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionTitle>Photos</SectionTitle>
              <button
                type="button"
                onClick={addPhotoUrl}
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Photo URL
              </button>
            </div>

            {/* Drag & Drop Upload Placeholder */}
            <div className="rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/30 p-8 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-3 text-sm font-medium text-gray-400">
                Drag & Drop Photos Here
              </p>
              <p className="mt-1 text-xs text-gray-600">
                File upload integration coming soon. Add photos via URL for now.
              </p>
              <button
                type="button"
                onClick={addPhotoUrl}
                className="mt-4 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-sm font-medium text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
              >
                Add Photo URL Instead
              </button>
            </div>

            {/* Photo List */}
            {photos.length > 0 && (
              <div className="space-y-3">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      photo.is_cover
                        ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5'
                        : 'border-gray-700 bg-gray-800/50'
                    }`}
                  >
                    {/* Drag Handle */}
                    <div className="flex flex-col gap-1 pt-2">
                      <button
                        type="button"
                        onClick={() => movePhoto(idx, 'up')}
                        disabled={idx === 0}
                        className="rounded p-0.5 text-gray-500 hover:text-white disabled:opacity-30"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Photo Preview */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-700">
                      {photo.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo.url}
                          alt={photo.alt || 'Venue photo'}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Fields */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={photo.url}
                        onChange={(e) => updatePhoto(idx, 'url', e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4AF37]"
                      />
                      <input
                        type="text"
                        value={photo.alt}
                        onChange={(e) => updatePhoto(idx, 'alt', e.target.value)}
                        placeholder="Alt text for accessibility"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => updatePhoto(idx, 'is_cover', true)}
                        className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                          photo.is_cover
                            ? 'bg-[#D4AF37] text-gray-950'
                            : 'border border-gray-700 text-gray-500 hover:text-[#D4AF37]'
                        }`}
                      >
                        {photo.is_cover ? 'Cover' : 'Set Cover'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <SectionTitle>Publishing Settings</SectionTitle>

            {/* Status */}
            <FormField label="Status" error={fieldError('status')}>
              <div className="flex gap-3">
                {VENUE_STATUSES.map((s) => (
                  <label
                    key={s}
                    className={`
                      flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all
                      ${
                        status === s
                          ? s === 'published'
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                            : s === 'draft'
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                            : 'border-gray-500/50 bg-gray-500/10 text-gray-400'
                          : 'border-gray-700 bg-gray-800 text-gray-500 hover:border-gray-600'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={status === s}
                      onChange={() => setStatus(s)}
                      className="sr-only"
                    />
                    <span
                      className={`h-2 w-2 rounded-full ${
                        s === 'published'
                          ? 'bg-emerald-400'
                          : s === 'draft'
                          ? 'bg-amber-400'
                          : 'bg-gray-400'
                      }`}
                    />
                    {STATUS_LABELS[s]}
                  </label>
                ))}
              </div>
            </FormField>

            {/* Priority Score */}
            <FormField
              label="Priority Score"
              hint="Higher scores appear first in listings (0-100)"
              error={fieldError('priority_score')}
            >
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={priorityScore}
                  onChange={(e) => setPriorityScore(parseInt(e.target.value))}
                  className="flex-1 accent-[#D4AF37]"
                />
                <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-gray-700 bg-gray-800">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={priorityScore}
                    onChange={(e) =>
                      setPriorityScore(
                        Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      )
                    }
                    className="w-full bg-transparent text-center text-sm font-medium text-white outline-none"
                  />
                </div>
              </div>
            </FormField>

            {/* Sponsored Toggle */}
            <FormField label="Sponsored Listing">
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isSponsored}
                    onChange={(e) => setIsSponsored(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`h-6 w-11 rounded-full transition-colors ${
                      isSponsored ? 'bg-[#D4AF37]' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
                        isSponsored ? 'translate-x-5.5 ml-[2px]' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-300">
                  {isSponsored
                    ? 'This venue is sponsored and will be highlighted'
                    : 'Not a sponsored listing'}
                </span>
              </label>
            </FormField>

            {/* Internal Notes */}
            <FormField label="Internal Notes" hint="Only visible to admins. Not shown publicly.">
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                placeholder="Add any internal notes about this venue..."
                className={`${inputClass()} resize-y`}
              />
              <p className="mt-1 text-xs text-gray-600">
                {internalNotes.length} / 2000 characters
              </p>
            </FormField>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5
              text-sm font-medium text-gray-300 hover:bg-gray-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5
              text-sm font-semibold text-gray-950 hover:bg-[#E5C349]
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {mode === 'create' ? 'Publish Venue' : 'Update & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-white">{children}</h2>;
}

function FormField({
  label,
  required,
  error,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-300">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-500" />}
        {label}
        {required && <span className="text-[#D4AF37]">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-600">{hint}</p>
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Style Helpers
// ──────────────────────────────────────────────

function inputClass(error?: string): string {
  return `w-full rounded-lg border ${
    error ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-[#D4AF37]'
  } bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 ${
    error ? 'focus:ring-red-500/30' : 'focus:ring-[#D4AF37]/30'
  } transition-colors`;
}

function selectClass(error?: string): string {
  return `w-full appearance-none rounded-lg border ${
    error ? 'border-red-500/50' : 'border-gray-700'
  } bg-gray-800 px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-colors`;
}
