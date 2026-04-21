import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import MasonryGrid from '../components/MasonryGrid';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { FaWhatsapp } from 'react-icons/fa';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '../components/ui/sonner';
import { getDemoArtisan, getDemoWorksByUser } from '../data/demoData';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ArtisanProfile = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArtisan();
    }, [userId]);

    const fetchArtisan = async () => {
        // Check if it's a demo user first
        if (userId.startsWith('demo_user_')) {
            const demoArtisan = getDemoArtisan(userId);
            const demoWorks = getDemoWorksByUser(userId);
            setProfile(demoArtisan);
            setWorks(demoWorks);
            setLoading(false);
            return;
        }
        
        try {
            const [profileRes, worksRes] = await Promise.all([
                axios.get(`${API}/profile/${userId}`),
                axios.get(`${API}/works`, { params: { user_id: userId } })
            ]);
            setProfile(profileRes.data);
            setWorks(worksRes.data);
        } catch (error) {
            console.error('Error fetching artisan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppContact = () => {
        if (profile?.whatsapp) {
            const message = encodeURIComponent(
                `Ciao! Ho visto il tuo profilo su Cuore Artigiano e sono interessato/a alle tue creazioni.`
            );
            window.open(`https://wa.me/${profile.whatsapp}?text=${message}`, '_blank');
        } else {
            toast.info('Questo è un profilo demo. Numero WhatsApp non disponibile.');
        }
    };

    const profileImageUrl = profile?.profile_image 
        ? (profile.profile_image.startsWith('http') ? profile.profile_image : `${API}/files/${profile.profile_image}`)
        : profile?.picture;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F6F0]">
                <Header />
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[#749274]" />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#F9F6F0]">
                <Header />
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 text-center">
                    <h1 className="text-2xl font-serif text-[#4A3018]">Artigiano non trovato</h1>
                    <Link to="/" className="text-[#749274] hover:underline mt-4 inline-block">
                        Torna alla home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F6F0]" data-testid="artisan-profile-page">
            <Header />

            {/* Back Button */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-6">
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-[#7A5E46] hover:text-[#4A3018] transition-colors"
                    data-testid="back-button"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla galleria
                </Link>
            </div>

            {/* Profile Hero */}
            <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-32 h-32 border-4 border-[#749274] mb-6">
                        <AvatarImage src={profileImageUrl} alt={profile.brand_name || profile.name} />
                        <AvatarFallback className="bg-[#749274] text-white text-4xl">
                            {(profile.brand_name || profile.name || 'A').charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <h1 
                        className="text-4xl sm:text-5xl font-serif font-bold text-[#2E5339] mb-4"
                        data-testid="artisan-brand-name"
                    >
                        {profile.brand_name || profile.name}
                    </h1>

                    {profile.bio && (
                        <p 
                            className="text-[#7A5E46] text-lg max-w-2xl mb-6"
                            data-testid="artisan-bio"
                        >
                            {profile.bio}
                        </p>
                    )}

                    <Button
                        onClick={handleWhatsAppContact}
                        className="bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full px-8 py-3 text-lg"
                        data-testid="contact-artisan-button"
                    >
                        <FaWhatsapp className="w-5 h-5 mr-2" />
                        Contatta l'Artigiano
                    </Button>

                    {/* Demo notice */}
                    {userId.startsWith('demo_user_') && (
                        <div className="mt-6 bg-[#F9F6F0] border border-[rgba(116,146,116,0.3)] rounded-xl p-4">
                            <p className="text-sm text-[#7A5E46]">
                                Questo è un profilo dimostrativo. Accedi per creare il tuo profilo artigiano!
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Divider */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">
                <div className="border-t border-[rgba(116,146,116,0.2)]" />
            </div>

            {/* Works Section */}
            <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
                <h2 className="text-2xl font-serif font-bold text-[#4A3018] mb-6">
                    Opere di {profile.brand_name || profile.name}
                </h2>
                <MasonryGrid 
                    works={works} 
                    emptyMessage="Questo artigiano non ha ancora pubblicato opere"
                />
            </section>
        </div>
    );
};

export default ArtisanProfile;
