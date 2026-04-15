import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { FaWhatsapp } from 'react-icons/fa';
import { Share2, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getDemoWork } from '../data/demoData';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WorkDetail = () => {
    const { workId } = useParams();
    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        fetchWork();
    }, [workId]);

    const fetchWork = async () => {
        // Check if it's a demo work first
        if (workId.startsWith('demo_')) {
            const demoWork = getDemoWork(workId);
            setWork(demoWork);
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.get(`${API}/works/${workId}`);
            setWork(response.data);
        } catch (error) {
            console.error('Error fetching work:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppClick = () => {
        if (work?.artisan_whatsapp) {
            const message = encodeURIComponent(
                `Ciao! Sono interessato/a alla tua opera "${work.title}" su Cuore Artigiano. Possiamo parlare?`
            );
            window.open(`https://wa.me/${work.artisan_whatsapp}?text=${message}`, '_blank');
        } else {
            toast.info('Questa è un\'opera demo. Numero WhatsApp non disponibile.');
        }
    };

    const handleShare = () => {
        const shareUrl = window.location.href;
        const shareText = `Guarda questa bellissima opera artigianale: "${work?.title}" di ${work?.artisan_name} su Cuore Artigiano!`;
        
        if (navigator.share) {
            navigator.share({
                title: work?.title,
                text: shareText,
                url: shareUrl
            }).catch(() => {});
        } else {
            const waText = encodeURIComponent(`${shareText} ${shareUrl}`);
            window.open(`https://wa.me/?text=${waText}`, '_blank');
        }
    };

    const allImages = work?.image_paths?.length > 0 
        ? work.image_paths 
        : (work?.image_path ? [work.image_path] : []);
    
    const getImageUrl = (path) => path?.startsWith('http') ? path : `${API}/files/${path}`;

    const artisanImageUrl = work?.artisan_picture?.startsWith('http')
        ? work.artisan_picture
        : (work?.artisan_picture ? `${API}/files/${work.artisan_picture}` : null);

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

    if (!work) {
        return (
            <div className="min-h-screen bg-[#F9F6F0]">
                <Header />
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 text-center">
                    <h1 className="text-2xl font-serif text-[#4A3018]">Opera non trovata</h1>
                    <Link to="/" className="text-[#749274] hover:underline mt-4 inline-block">
                        Torna alla home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F6F0]" data-testid="work-detail-page">
            <Header />

            <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
                {/* Back Button */}
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-[#7A5E46] hover:text-[#4A3018] transition-colors mb-6"
                    data-testid="back-button"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Torna alla galleria
                </Link>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="rounded-2xl overflow-hidden shadow-soft relative">
                        <img
                            src={getImageUrl(allImages[activeImageIndex])}
                            alt={work.title}
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/600x800?text=Immagine+non+disponibile';
                            }}
                            data-testid="work-image"
                        />
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImageIndex(i => (i - 1 + allImages.length) % allImages.length)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                                    data-testid="prev-image-btn"
                                >
                                    <ChevronLeft className="w-5 h-5 text-[#4A3018]" />
                                </button>
                                <button
                                    onClick={() => setActiveImageIndex(i => (i + 1) % allImages.length)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                                    data-testid="next-image-btn"
                                >
                                    <ChevronRight className="w-5 h-5 text-[#4A3018]" />
                                </button>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                    {allImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === activeImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block bg-[#2E5339] text-white text-sm px-4 py-1 rounded-full mb-4">
                                {work.category}
                            </span>
                            <h1 
                                className="text-3xl sm:text-4xl font-serif font-bold text-[#2E5339] mb-4"
                                data-testid="work-title"
                            >
                                {work.title}
                            </h1>
                            {work.description && (
                                <p 
                                    className="text-[#7A5E46] text-lg"
                                    data-testid="work-description"
                                >
                                    {work.description}
                                </p>
                            )}
                        </div>

                        {/* Artisan Info */}
                        <div className="bg-white rounded-xl p-6 shadow-soft">
                            <Link 
                                to={`/artisan/${work.user_id}`}
                                className="flex items-center gap-4 mb-4"
                                data-testid="artisan-link"
                            >
                                <Avatar className="w-16 h-16 border-2 border-[#749274]">
                                    <AvatarImage src={artisanImageUrl} alt={work.artisan_name} />
                                    <AvatarFallback className="bg-[#749274] text-white text-xl">
                                        {(work.artisan_name || 'A').charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-[#7A5E46]">Creato da</p>
                                    <p className="text-lg font-semibold text-[#4A3018] hover:text-[#2E5339] transition-colors">
                                        {work.artisan_name}
                                    </p>
                                </div>
                            </Link>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={handleWhatsAppClick}
                                    className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full"
                                    data-testid="contact-button"
                                >
                                    <FaWhatsapp className="w-5 h-5 mr-2" />
                                    Contatta l'Artigiano
                                </Button>
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    className="border-[#749274] text-[#4A3018] hover:bg-[#F9F6F0] rounded-full"
                                    data-testid="share-button"
                                >
                                    <Share2 className="w-5 h-5 mr-2" />
                                    Condividi
                                </Button>
                            </div>
                        </div>

                        {/* Demo notice */}
                        {workId.startsWith('demo_') && (
                            <div className="bg-[#F9F6F0] border border-[rgba(116,146,116,0.3)] rounded-xl p-4 text-center">
                                <p className="text-sm text-[#7A5E46]">
                                    Questa è un'opera dimostrativa. Accedi per pubblicare le tue creazioni!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkDetail;
