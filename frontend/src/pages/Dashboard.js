import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import MasonryGrid from '../components/MasonryGrid';
import { CATEGORIES } from '../components/CategoryFilters';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Plus, Camera, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
    const { user, loading: authLoading, isAuthenticated, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false);
    const fileInputRef = useRef(null);
    const profileImageInputRef = useRef(null);

    const [profileForm, setProfileForm] = useState({
        brand_name: '',
        bio: '',
        whatsapp: ''
    });

    const [workForm, setWorkForm] = useState({
        title: '',
        description: '',
        category: '',
        image_path: ''
    });

    const [workImagePreview, setWorkImagePreview] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (user) {
            setProfileForm({
                brand_name: user.brand_name || '',
                bio: user.bio || '',
                whatsapp: user.whatsapp || ''
            });
            fetchMyWorks();
        }
    }, [user]);

    const fetchMyWorks = async () => {
        try {
            const response = await axios.get(`${API}/works`, {
                params: { user_id: user?.user_id },
                withCredentials: true
            });
            setWorks(response.data);
        } catch (error) {
            console.error('Error fetching works:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileForm);
            toast.success('Profilo aggiornato con successo!');
            setIsProfileDialogOpen(false);
        } catch (error) {
            toast.error('Errore nell\'aggiornamento del profilo');
        }
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const response = await axios.post(`${API}/upload`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            await updateProfile({ profile_image: response.data.path });
            toast.success('Foto profilo aggiornata!');
        } catch (error) {
            toast.error('Errore nel caricamento dell\'immagine');
        } finally {
            setUploading(false);
        }
    };

    const handleWorkImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const response = await axios.post(`${API}/upload`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setWorkForm(prev => ({ ...prev, image_path: response.data.path }));
            setWorkImagePreview(URL.createObjectURL(file));
            toast.success('Immagine caricata!');
        } catch (error) {
            toast.error('Errore nel caricamento dell\'immagine');
        } finally {
            setUploading(false);
        }
    };

    const handleWorkSubmit = async (e) => {
        e.preventDefault();
        
        if (!workForm.title || !workForm.category || !workForm.image_path) {
            toast.error('Compila tutti i campi obbligatori');
            return;
        }

        try {
            await axios.post(`${API}/works`, workForm, { withCredentials: true });
            toast.success('Opera pubblicata con successo!');
            setIsWorkDialogOpen(false);
            setWorkForm({ title: '', description: '', category: '', image_path: '' });
            setWorkImagePreview('');
            fetchMyWorks();
        } catch (error) {
            toast.error('Errore nella pubblicazione dell\'opera');
        }
    };

    const handleDeleteWork = async (workId) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa opera?')) return;

        try {
            await axios.delete(`${API}/works/${workId}`, { withCredentials: true });
            toast.success('Opera eliminata');
            fetchMyWorks();
        } catch (error) {
            toast.error('Errore nell\'eliminazione dell\'opera');
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#749274]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const profileImageUrl = user?.profile_image 
        ? (user.profile_image.startsWith('http') ? user.profile_image : `${API}/files/${user.profile_image}`)
        : user?.picture;

    return (
        <div className="min-h-screen bg-[#F9F6F0]" data-testid="dashboard-page">
            <Header />

            {/* Profile Section */}
            <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Profile Image */}
                        <div className="relative">
                            <Avatar className="w-28 h-28 border-4 border-[#749274]">
                                <AvatarImage src={profileImageUrl} alt={user?.brand_name || user?.name} />
                                <AvatarFallback className="bg-[#749274] text-white text-3xl">
                                    {(user?.brand_name || user?.name || 'U').charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={() => profileImageInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-[#2E5339] text-white rounded-full p-2 hover:bg-[#1e3a26] transition-colors"
                                data-testid="change-profile-image"
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            </button>
                            <input
                                ref={profileImageInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfileImageUpload}
                            />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-serif font-bold text-[#2E5339] mb-2">
                                {user?.brand_name || user?.name || 'Il tuo profilo'}
                            </h1>
                            <p className="text-[#7A5E46] mb-4 max-w-lg">
                                {user?.bio || 'Aggiungi una descrizione per presentarti agli altri artigiani'}
                            </p>
                            
                            {/* Edit Profile Dialog */}
                            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="border-[#749274] text-[#4A3018] hover:bg-[#F9F6F0]"
                                        data-testid="edit-profile-button"
                                    >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Modifica Profilo
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="font-serif text-[#2E5339]">Modifica Profilo</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="brand_name" className="text-[#4A3018]">Nome Brand</Label>
                                            <Input
                                                id="brand_name"
                                                value={profileForm.brand_name}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, brand_name: e.target.value }))}
                                                placeholder="Es: Ceramiche di Luna"
                                                className="border-[rgba(116,146,116,0.3)] focus:border-[#749274]"
                                                data-testid="brand-name-input"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="bio" className="text-[#4A3018]">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                value={profileForm.bio}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                                                placeholder="Raccontaci la tua storia e la tua passione per l'artigianato..."
                                                className="border-[rgba(116,146,116,0.3)] focus:border-[#749274] min-h-[100px]"
                                                data-testid="bio-input"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="whatsapp" className="text-[#4A3018]">WhatsApp (con prefisso)</Label>
                                            <Input
                                                id="whatsapp"
                                                value={profileForm.whatsapp}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                                                placeholder="Es: 393331234567"
                                                className="border-[rgba(116,146,116,0.3)] focus:border-[#749274]"
                                                data-testid="whatsapp-input"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-[#749274] hover:bg-[#648064] text-white"
                                            data-testid="save-profile-button"
                                        >
                                            Salva Modifiche
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </section>

            {/* My Works Section */}
            <section className="max-w-[1600px] mx-auto px-4 md:px-8 pb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-bold text-[#4A3018]">Le Mie Opere</h2>
                    
                    {/* Add Work Dialog */}
                    <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-[#749274] hover:bg-[#648064] text-white rounded-full"
                                data-testid="add-work-button"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Aggiungi Opera
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="font-serif text-[#2E5339]">Nuova Opera</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleWorkSubmit} className="space-y-4">
                                {/* Image Upload */}
                                <div>
                                    <Label className="text-[#4A3018]">Immagine *</Label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 border-2 border-dashed border-[rgba(116,146,116,0.3)] rounded-xl p-6 text-center cursor-pointer hover:border-[#749274] transition-colors"
                                    >
                                        {workImagePreview ? (
                                            <img 
                                                src={workImagePreview} 
                                                alt="Preview" 
                                                className="max-h-48 mx-auto rounded-lg"
                                            />
                                        ) : (
                                            <div className="text-[#7A5E46]">
                                                {uploading ? (
                                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                                ) : (
                                                    <Camera className="w-8 h-8 mx-auto mb-2" />
                                                )}
                                                <p>Clicca per caricare un'immagine</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleWorkImageUpload}
                                        data-testid="work-image-input"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="title" className="text-[#4A3018]">Titolo *</Label>
                                    <Input
                                        id="title"
                                        value={workForm.title}
                                        onChange={(e) => setWorkForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Es: Orecchini in ceramica blu"
                                        className="border-[rgba(116,146,116,0.3)] focus:border-[#749274]"
                                        data-testid="work-title-input"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category" className="text-[#4A3018]">Categoria *</Label>
                                    <Select
                                        value={workForm.category}
                                        onValueChange={(value) => setWorkForm(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger className="border-[rgba(116,146,116,0.3)]" data-testid="work-category-select">
                                            <SelectValue placeholder="Seleziona categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.filter(c => c !== 'Tutti').map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-[#4A3018]">Descrizione</Label>
                                    <Textarea
                                        id="description"
                                        value={workForm.description}
                                        onChange={(e) => setWorkForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Descrivi la tua opera..."
                                        className="border-[rgba(116,146,116,0.3)] focus:border-[#749274]"
                                        data-testid="work-description-input"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#749274] hover:bg-[#648064] text-white"
                                    disabled={!workForm.title || !workForm.category || !workForm.image_path}
                                    data-testid="publish-work-button"
                                >
                                    Pubblica Opera
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-[#749274]" />
                    </div>
                ) : works.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-xl font-serif text-[#4A3018] mb-2">Nessuna opera pubblicata</h3>
                        <p className="text-[#7A5E46] mb-6">Inizia a condividere le tue creazioni con la comunità!</p>
                        <Button
                            onClick={() => setIsWorkDialogOpen(true)}
                            className="bg-[#749274] hover:bg-[#648064] text-white rounded-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Pubblica la tua prima opera
                        </Button>
                    </div>
                ) : (
                    <div className="relative">
                        <MasonryGrid works={works} />
                        {/* Delete buttons overlay - shown in dashboard */}
                        <style>{`
                            [data-testid^="work-card-"] {
                                position: relative;
                            }
                        `}</style>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
