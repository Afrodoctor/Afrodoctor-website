import React, { useEffect, useRef, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// create a single client instance (safe to create on module load using public anon key)
const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- TYPESCRIPT INTERFACES (kept as is) ---
interface HMSPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPrimary: boolean;
  createdAt?: { seconds: number };
}

interface NewPlanData {
  name: string;
  price: string;
  features: string; // comma-separated in UI
  isPrimary: boolean;
}

interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  uploadedAt: { seconds: number };
}

interface ItemToDelete {
  id: string;
  type: 'plan' | 'media';
  name: string;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const PLANS_TABLE = 'hms_plans';
const MEDIA_TABLE = 'image_catalogue';
const STORAGE_BUCKET = 'artifacts';
const STORAGE_PUBLIC_PATH = 'public/media';

const ProductCatalogAdmin: React.FC = () => {
  // --- STATE (updated with new UX states) ---
  const [plans, setPlans] = useState<HMSPlan[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth and Security States
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newPlan, setNewPlan] = useState<NewPlanData>({ name: '', price: '', features: '', isPrimary: false });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  // Modal & deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Keep references to channel subscriptions so we can remove them on cleanup
  const plansChannelRef = useRef<any>(null);
  const mediaChannelRef = useRef<any>(null);

  // --- TOAST MANAGEMENT ---
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
   
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // --- LOGIC (kept the same for functionality) ---
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        const user = data?.session?.user;
        if (!mounted) return;
        // In a real app, this should check for a 'admin' role claim!
        setIsAdmin(!!user);
        setAuthReady(true);
      } catch (err) {
        console.error('Supabase auth init error:', err);
        setError('Failed to initialize authentication. Is Supabase client configured?');
        setAuthReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabaseClient.from(PLANS_TABLE).select('*');
      if (error) throw error;
      const fetchedPlans: HMSPlan[] = (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        price: d.price,
        features: d.features ? d.features.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
        isPrimary: !!d.is_primary,
        createdAt: d.created_at ? { seconds: new Date(d.created_at).getTime() / 1000 } : undefined,
      }));

      fetchedPlans.sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      });

      setPlans(fetchedPlans);
      setError(null); // Clear errors on successful fetch
    } catch (err) {
      console.error('fetchPlans error', err);
      setError('Failed to fetch plans.');
    }
  };

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabaseClient.from(MEDIA_TABLE).select('*').order('uploaded_at', { ascending: false });
      if (error) throw error;

      const fetchedMedia: MediaItem[] = (data || []).map((d: any) => ({
        id: d.id,
        fileName: d.file_name,
        url: d.url,
        uploadedAt: d.uploaded_at ? { seconds: new Date(d.uploaded_at).getTime() / 1000 } : { seconds: 0 },
      }));

      setMediaItems(fetchedMedia);
      setError(null); // Clear errors on successful fetch
    } catch (err) {
      console.error('fetchMedia error', err);
      setError('Failed to fetch media.');
    }
  };

  // --- SETUP REALTIME LISTENERS (kept as is) ---
  useEffect(() => {
    if (!authReady) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchMedia()]);

      try {
        const plansChannel = supabaseClient.channel('plans-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: PLANS_TABLE }, () => fetchPlans())
          .subscribe();
        plansChannelRef.current = plansChannel;

        const mediaChannel = supabaseClient.channel('media-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: MEDIA_TABLE }, () => fetchMedia())
          .subscribe();
        mediaChannelRef.current = mediaChannel;
      } catch (err) {
        console.warn('Realtime subscription error (non-fatal):', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      try {
        if (plansChannelRef.current) supabaseClient.removeChannel(plansChannelRef.current);
        if (mediaChannelRef.current) supabaseClient.removeChannel(mediaChannelRef.current);
      } catch (err) {
        console.warn('Error removing channels:', err);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  // --- PLAN CRUD (enhanced with UX feedback) ---
  const handleNewPlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setNewPlan((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast('Permission Denied: You must be an administrator.', 'error');
      return;
    }

    setIsAddingPlan(true);

    try {
      const payload = {
        name: newPlan.name.trim(),
        price: newPlan.price.trim(),
        features: newPlan.features.split(',').map((f) => f.trim()).filter(Boolean).join(', '),
        is_primary: newPlan.isPrimary,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabaseClient.from(PLANS_TABLE).insert([payload]);
      if (error) throw error;

      await fetchPlans();
      setNewPlan({ name: '', price: '', features: '', isPrimary: false });
      addToast(`Plan "${payload.name}" added successfully!`, 'success');
    } catch (err) {
      console.error('handleAddPlan error:', err);
      addToast('Failed to add plan. Check Supabase RLS policies.', 'error');
    } finally {
      setIsAddingPlan(false);
    }
  };

  const handleDeletePlanPrompt = (plan: HMSPlan) => {
    if (!isAdmin) return;
    setItemToDelete({ id: plan.id, type: 'plan', name: plan.name });
    setShowDeleteModal(true);
  };

  // --- MEDIA UPLOAD (enhanced with UX feedback) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      addToast(`File selected: ${e.target.files[0].name}`, 'info');
    } else {
      setUploadFile(null);
    }
  };

  const handleMediaUpload = async () => {
    if (!isAdmin) {
      addToast('Permission Denied: You must be an administrator.', 'error');
      return;
    }
    if (!uploadFile) {
      addToast('Please select a file to upload.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const safeFileName = `${Date.now()}_${uploadFile.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
      const storagePath = `${STORAGE_PUBLIC_PATH}/${safeFileName}`;

      addToast(`Starting upload: ${uploadFile.name}...`, 'info');

      const { error: uploadError } = await supabaseClient.storage.from(STORAGE_BUCKET).upload(storagePath, uploadFile, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) throw uploadError;

      // Update progress for UX (simulated since Supabase storage doesn't provide real-time progress)
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for visual effect
      }

      const { data: urlData } = supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabaseClient.from(MEDIA_TABLE).insert([{
        file_name: safeFileName,
        url: publicUrl,
        uploaded_at: new Date().toISOString(),
      }]);

      if (dbError) throw dbError;

      await fetchMedia();
      setUploadFile(null);
      addToast(`Image "${uploadFile.name}" uploaded successfully!`, 'success');
    } catch (err: any) {
      console.error('handleMediaUpload error:', err);
      addToast(err?.message || 'Upload failed. Check storage policies.', 'error');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
      // Clear file input value to allow re-uploading the same file (if user cancels after picking)
      (document.getElementById('file-upload') as HTMLInputElement).value = '';
    }
  };

  const handleDeleteMediaPrompt = (mediaItem: MediaItem) => {
    if (!isAdmin) return;
    setItemToDelete({ id: mediaItem.id, type: 'media', name: mediaItem.fileName });
    setShowDeleteModal(true);
  };

  // --- CONFIRM DELETION (enhanced with UX feedback) ---
  const confirmDeletion = async () => {
    if (!itemToDelete) return;
    setShowDeleteModal(false);

    const { id, type, name } = itemToDelete;

    if (!isAdmin) {
      addToast('Permission Denied: You must be an administrator.', 'error');
      return;
    }

    try {
      if (type === 'plan') {
        const { error } = await supabaseClient.from(PLANS_TABLE).delete().eq('id', id);
        if (error) throw error;
        await fetchPlans();
        addToast(`Plan "${name}" deleted successfully!`, 'success');
      } else if (type === 'media') {
        const { data: itemData, error: fetchError } = await supabaseClient.from(MEDIA_TABLE).select('file_name').eq('id', id).single();
        if (fetchError || !itemData) throw fetchError || new Error('Media not found');

        const filePath = `${STORAGE_PUBLIC_PATH}/${itemData.file_name}`;
        const { error: storageError } = await supabaseClient.storage.from(STORAGE_BUCKET).remove([filePath]);
        if (storageError) throw storageError;

        const { error: dbError } = await supabaseClient.from(MEDIA_TABLE).delete().eq('id', id);
        if (dbError) throw dbError;

        await fetchMedia();
        addToast(`Media "${name}" deleted successfully!`, 'success');
      }
    } catch (err) {
      console.error('confirmDeletion error:', err);
      addToast(`Failed to delete ${type} "${name}". Check RLS.`, 'error');
    } finally {
      setItemToDelete(null);
    }
  };

  // --- TOAST COMPONENT ---
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-80 max-w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl shadow-lg border-l-4 transform transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400 text-green-800 dark:text-green-200'
              : toast.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-800 dark:text-blue-200'
          } animate-in slide-in-from-right-full`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {toast.type === 'success' && (
                <svg className="w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 001.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
              <p className="text-sm font-medium flex-1">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
 
  // --- ENHANCED DELETE CONFIRMATION MODAL ---
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !itemToDelete) return null;
    const isMedia = itemToDelete.type === 'media';
    const typeText = isMedia ? 'Image/Media' : 'Pricing Plan';
   
    return (
      <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-opacity duration-300">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete {typeText}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
           
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium truncate" title={itemToDelete.name}>
                {itemToDelete.name}
              </p>
            </div>
           
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this {typeText.toLowerCase()}? This will permanently remove
              {isMedia ? ' the file from storage and database.' : ' the plan from the system.'}
            </p>
           
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletion}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-700 border border-transparent rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  // --- MAIN RENDER ---
 
  if (!authReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl text-center border-t-4 border-red-500 dark:border-red-400">
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Access Denied 🔒</h2>
          <p className="text-gray-600 dark:text-gray-400">You must be logged in as an administrator to access this panel.</p>
          <a href="/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mt-6 inline-block px-6 py-3 text-sm font-semibold rounded-lg">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-12 relative transition-colors duration-300">
      <ToastContainer />
      {DeleteConfirmationModal()}

      <header className="mb-10 pb-4 border-b-4 border-blue-500/10 dark:border-blue-400/20">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mr-3 shadow-lg">🛠️</span>  {/* Kept gradient for accent, as it's small */}
          Afrodoctor CMS Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage HMS Plans and Marketing Media Assets.</p>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Syncing data...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* --- PLANS MANAGEMENT --- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3 flex items-center">
              <span className="text-blue-600 dark:text-blue-400 mr-2">🌟</span> Manage HMS Plans
            </h2>

            {/* Existing Plans Table */}
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Features</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Primary?</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{plan.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">{plan.features.join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {plan.isPrimary ? <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">Primary</span> : <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Standard</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeletePlanPrompt(plan)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ml-4 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label={`Delete ${plan.name}`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No plans found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* New Plan Form */}
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 pt-4 border-t border-gray-200 dark:border-gray-600">Add New Plan</h3>
            <form onSubmit={handleAddPlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Plan Name</span>
                  <input
                    type="text"
                    name="name"
                    value={newPlan.name}
                    onChange={handleNewPlanChange}
                    required
                    disabled={isAddingPlan}
                    className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500/50 p-3 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Price (Text)</span>
                  <input
                    type="text"
                    name="price"
                    value={newPlan.price}
                    onChange={handleNewPlanChange}
                    required
                    disabled={isAddingPlan}
                    className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500/50 p-3 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., $499 or Contact"
                  />
                </label>
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="isPrimary"
                    checked={newPlan.isPrimary}
                    onChange={handleNewPlanChange}
                    disabled={isAddingPlan}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    id="isPrimaryCheckbox"
                  />
                  <label htmlFor="isPrimaryCheckbox" className="ml-3 text-gray-700 dark:text-gray-300 font-medium select-none">Mark as Primary/Featured</label>
                </div>
              </div>
             
              <label className="block">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Features (Comma-separated)</span>
                <textarea
                  name="features"
                  value={newPlan.features}
                  onChange={handleNewPlanChange}
                  required
                  disabled={isAddingPlan}
                  className="mt-1 block w-full rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500/50 p-3 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="e.g., Unlimited Users, Cloud Sync, 24/7 Support"
                ></textarea>
              </label>

              <button
                type="submit"
                disabled={isAddingPlan || loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full px-6 py-3 text-base font-semibold rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                {isAddingPlan ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Plan...
                  </>
                ) : (
                  'Add New Pricing Plan'
                )}
              </button>
            </form>
          </section>

          {/* --- MEDIA MANAGEMENT --- */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3 flex items-center">
              <span className="text-red-600 dark:text-red-400 mr-2">🖼️</span> Media Asset Catalogue
            </h2>
           
            {/* Media Upload Form */}
            <div className="mb-8 p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Upload New Asset</h3>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow">
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1" htmlFor="file-upload">
                    Select Image/Media File
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800/50 disabled:opacity-50"
                  />
                  {uploadFile && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
               
                <button
                  onClick={handleMediaUpload}
                  disabled={isUploading || !uploadFile}
                  className="bg-blue-900 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-700 text-white w-full md:w-auto px-6 py-3 text-base font-semibold rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading... ({uploadProgress}%)
                    </>
                  ) : (
                    'Upload Asset'
                  )}
                </button>
              </div>
              {isUploading && (
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-3">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Existing Media Grid */}
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 pt-4 border-t border-gray-200 dark:border-gray-600">Existing Assets ({mediaItems.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative group bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-600">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={item.url}
                      alt={item.fileName}
                      className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </a>
                  <div className="p-3">
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate mb-1" title={item.fileName}>{item.fileName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(new Date(item.uploadedAt.seconds * 1000)).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDeleteMediaPrompt(item)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-600 dark:bg-red-700 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 dark:hover:bg-red-800 shadow-lg"
                      aria-label={`Delete ${item.fileName}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {mediaItems.length === 0 && (
                <div className="col-span-4 py-8 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">No media assets uploaded yet.</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogAdmin;