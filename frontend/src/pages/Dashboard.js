import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/sonner';
import { Loader2, Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
    const { user, isAuthenticated, loading: authLoading, updateProfile, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState({
        brand_name: '',
        bio: '',
        whatsapp: ''
    });
    
    const [myWorks, setMyWorks] = useState([]);
    const [loadingWorks, setLoadingWorks] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    
    // Form for new work
    const [newWork, setNewWork] = useState({
        title: '',
        description: '',
        category: 'Orecchini',
        image_path: 'https://via.placeholder.com/600x800?text=Anteprima+Opera'
    });
    const [isAddingWork, setIsAddingWork] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            setProfileData({
                brand_name: user.brand_name || '',
                bio: user.bio || '',
                whatsapp: user.whatsapp || ''
            });
            fetchMyWorks();
        }
    }, [user]);

    const fetchMyWorks = async () => {
        if (!user) return;
        setLoadingWorks(true);
        try {
            const response = await axios.get(`${API}/works`, {
                params: { user_id: user.user_id }
            });
            setMyWorks(response.data);
        } catch (error) {
            console.error('Error fetching my works:', error);
            toast.error('Errore nel caricamento delle opere');
        } finally {
            setLoadingWorks(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            await updateProfile(profileData);
            toast.success('Profilo aggiornato con successo!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Errore durante l\'aggiornamento del profilo');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAddWork = async (e) => {
        e.preventDefault();
        setIsAddingWork(true);
        try {
            const response = await axios.post(`${API}/works`, newWork, {
                headers: getAuthHeaders()
            });
            setMyWorks([response.data, ...myWorks]);
            setNewWork({
                title: '',
                description: '',
                category: 'Orecchini',
                image_path: 'https://via.placeholder.com/600x800?text=Anteprima+Opera'
            });
            toast.success('Opera aggiunta con successo!');
        } catch (error) {
            console.error('Error adding work:', error);
            toast.error('Errore durante l\'aggiunta dell\'opera');
        } finally {
            setIsAddingWork(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-[#F9F6F0]">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#749274]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F6F0]">
            <Header />
            
            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
                <h1 className="text-3xl font-serif font-bold text-[#2E5339] mb-8">
                    Il Tuo Pannello di Controllo
                </h1>
                
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="bg-white border border-[rgba(116,146,116,0.2)] rounded-full p-1">
                        <TabsTrigger value="profile" className="rounded-full px-6">Profilo</TabsTrigger>
                        <TabsTrigger value="works" className="rounded-full px-6">Le Mie Opere</TabsTrigger>
                        <TabsTrigger value="add" className="rounded-full px-6">Aggiungi Opera</TabsTrigger>
                    </TabsList>
                    
                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card className="border-[rgba(116,146,116,0.2)] shadow-soft">
                            <CardHeader>
                                <CardTitle className="text-[#4A3018]">Informazioni Profilo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="brand_name">Nome Brand / Nome d'Arte</Label>
                                        <Input 
                                            id="brand_name"
                                            value={profileData.brand_name}
                                            onChange={(e) => setProfileData({...profileData, brand_name: e.target.value})}
                                            placeholder="Es: Ceramiche del Sole"
                                            className="border-[rgba(116,146,116,0.3)] focus-visible:ring-[#749274]"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Biografia / Descrizione</Label>
                                        <Textarea 
                                            id="bio"
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                            placeholder="Racconta la tua storia e la tua passione..."
                                            className="min-h-[120px] border-[rgba(116,146,116,0.3)] focus-visible:ring-[#749274]"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp">Numero WhatsApp (per i contatti)</Label>
                                        <Input 
                                            id="whatsapp"
                                            value={profileData.whatsapp}
                                            onChange={(e) => setProfileData({...profileData, whatsapp: e.target.value})}
                                            placeholder="Es: 393331234567 (senza +)"
                                            className="border-[rgba(116,146,116,0.3)] focus-visible:ring-[#749274]"
                                        />
                                        <p className="text-xs text-[#7A5E46]">Includi il prefisso internazionale senza il segno +, es: 39 per l'Italia.</p>
                                    </div>
                                    
                                    <Button 
                                        type="submit" 
                                        disabled={isSavingProfile}
                                        className="bg-[#2E5339] hover:bg-[#1e3a26] text-white rounded-full px-8"
                                    >
                                        {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                                        Salva Modifiche
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* Works List Tab */}
                    <TabsContent value="works">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loadingWorks ? (
                                <div className="col-span-full flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#749274]" />
                                </div>
                            ) : myWorks.length === 0 ? (
                                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-dashed border-[rgba(116,146,116,0.4)]">
                                    <ImageIcon className="w-12 h-12 text-[#749274] mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-serif text-[#4A3018] mb-2">Non hai ancora pubblicato opere</h3>
                                    <p className="text-[#7A5E46] mb-6">Inizia a condividere le tue creazioni con la community!</p>
                                    <Button onClick={() => document.querySelector('[value="add"]').click()} className="bg-[#749274] hover:bg-[#5f7a5f] rounded-full">
                                        <Plus className="w-4 h-4 mr-2" /> Pubblica la tua prima opera
                                    </Button>
                                </div>
                            ) : (
                                myWorks.map(work => (
                                    <Card key={work.work_id} className="overflow-hidden border-[rgba(116,146,116,0.2)] shadow-soft">
                                        <div className="aspect-[4/5] relative overflow-hidden">
                                            <img 
                                                src={work.image_path} 
                                                alt={work.title}
                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-[#4A3018] line-clamp-1">{work.title}</h3>
                                                <span className="text-xs bg-[#F9F6F0] text-[#749274] px-2 py-0.5 rounded-full border border-[rgba(116,146,116,0.2)]">
                                                    {work.category}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <Button variant="outline" size="sm" className="flex-1 rounded-full border-[rgba(116,146,116,0.3)] text-[#7A5E46]">
                                                    <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Modifica
                                                </Button>
                                                <Button variant="outline" size="sm" className="rounded-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                    
                    {/* Add Work Tab */}
                    <TabsContent value="add">
                        <Card className="border-[rgba(116,146,116,0.2)] shadow-soft">
                            <CardHeader>
                                <CardTitle className="text-[#4A3018]">Pubblica Nuova Opera</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddWork} className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Titolo dell'Opera</Label>
                                            <Input 
                                                id="title"
                                                required
                                                value={newWork.title}
                                                onChange={(e) => setNewWork({...newWork, title: e.target.value})}
                                                placeholder="Es: Orecchini a foglia in argento"
                                                className="border-[rgba(116,146,116,0.3)] focus-visible:ring-[#749274]"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Categoria</Label>
                                            <select 
                                                id="category"
                                                className="w-full flex h-10 rounded-md border border-[rgba(116,146,116,0.3)] bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#749274] focus:ring-offset-2"
                                                value={newWork.category}
                                                onChange={(e) => setNewWork({...newWork, category: e.target.value})}
                                            >
                                                <option>Orecchini</option>
                                                <option>Collane</option>
                                                <option>Ciondoli</option>
                                                <option>Borse</option>
                                                <option>Ciondoli per capelli</option>
                                                <option>Scacciapensieri</option>
                                                <option>Uncinetto</option>
                                            </select>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descrizione</Label>
                                            <Textarea 
                                                id="description"
                                                required
                                                value={newWork.description}
                                                onChange={(e) => setNewWork({...newWork, description: e.target.value})}
                                                placeholder="Descrivi i materiali utilizzati, la tecnica, le dimensioni..."
                                                className="min-h-[120px] border-[rgba(116,146,116,0.3)] focus-visible:ring-[#749274]"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="image">URL Immagine (Demo)</Label>
                                            <Input 
                                                id="image"
                                                value={newWork.image_path}
                                                onChange={(e) => setNewWork({...newWork, image_path: e.target.value})}
                                                placeholder="https://..."
                                                className="border-[rgba(116,146,116,0.3)] focus-visible:ring-[#749274]"
                                            />
                                            <p className="text-xs text-[#7A5E46]">In questa demo usiamo URL diretti. In produzione ci sarà l'upload.</p>
                                        </div>
                                        
                                        <Button 
                                            type="submit" 
                                            disabled={isAddingWork}
                                            className="w-full bg-[#2E5339] hover:bg-[#1e3a26] text-white rounded-full"
                                        >
                                            {isAddingWork ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                            Pubblica Opera
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <Label>Anteprima</Label>
                                        <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-[rgba(116,146,116,0.2)] bg-white shadow-inner flex items-center justify-center">
                                            <img 
                                                src={newWork.image_path} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/600x800?text=Anteprima+Opera';
                                                }}
                                            />
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-xl border border-[rgba(116,146,116,0.1)]">
                                            <h4 className="font-serif font-bold text-[#2E5339] text-xl">{newWork.title || 'Titolo Opera'}</h4>
                                            <p className="text-[#7A5E46] text-sm mt-1">{newWork.category}</p>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Dashboard;
