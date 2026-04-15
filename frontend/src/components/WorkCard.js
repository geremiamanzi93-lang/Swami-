import { useNavigate } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { Share2, Heart } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WorkCard = ({ work, isLiked: initialIsLiked = false, onLikeToggle }) => {
    const navigate = useNavigate();
    const { isAuthenticated, login, getAuthHeaders } = useAuth();
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [liking, setLiking] = useState(false);
    
    const imageUrl = work.image_path?.startsWith('http') 
        ? work.image_path 
        : `${API}/files/${work.image_path}`;
    
    const handleCardClick = () => {
        navigate(`/work/${work.work_id}`);
    };
    
    const handleWhatsAppClick = (e) => {
        e.stopPropagation();
        
        if (work.artisan_whatsapp) {
            const message = encodeURIComponent(
                `Ciao! Sono interessato/a alla tua opera "${work.title}" su Cuore Artigiano. Possiamo parlare?`
            );
            window.open(`https://wa.me/${work.artisan_whatsapp}?text=${message}`, '_blank');
        } else {
            toast.error('Numero WhatsApp non disponibile');
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        
        const shareUrl = `${window.location.origin}/work/${work.work_id}`;
        const shareText = `Guarda questa bellissima opera artigianale: "${work.title}" di ${work.artisan_name} su Cuore Artigiano!`;
        
        if (navigator.share) {
            navigator.share({
                title: work.title,
                text: shareText,
                url: shareUrl
            }).catch(() => {});
        } else {
            const waText = encodeURIComponent(`${shareText} ${shareUrl}`);
            window.open(`https://wa.me/?text=${waText}`, '_blank');
        }
    };
    
    const handleLike = async (e) => {
        e.stopPropagation();
        
        if (!isAuthenticated) {
            toast('Accedi per salvare le opere nei preferiti', {
                action: {
                    label: 'Accedi',
                    onClick: login
                }
            });
            return;
        }
        
        if (liking || work.work_id.startsWith('demo_')) {
            if (work.work_id.startsWith('demo_')) {
                // For demo works, just toggle locally
                setIsLiked(!isLiked);
                toast.success(isLiked ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti');
            }
            return;
        }
        
        setLiking(true);
        try {
            const response = await axios.post(
                `${API}/works/${work.work_id}/like`,
                {},
                { withCredentials: true, headers: getAuthHeaders() }
            );
            setIsLiked(response.data.liked);
            if (onLikeToggle) onLikeToggle(work.work_id, response.data.liked);
        } catch (error) {
            toast.error('Errore nel salvataggio');
        } finally {
            setLiking(false);
        }
    };
    
    const handleArtisanClick = (e) => {
        e.stopPropagation();
        navigate(`/artisan/${work.user_id}`);
    };

    return (
        <div 
            className="break-inside-avoid mb-6 group cursor-pointer"
            data-testid={`work-card-${work.work_id}`}
            onClick={handleCardClick}
        >
            <div className="relative overflow-hidden rounded-2xl shadow-soft card-hover">
                <img
                    src={imageUrl}
                    alt={work.title}
                    className="w-full h-auto object-cover image-hover"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x500?text=Immagine+non+disponibile';
                    }}
                />
                
                {/* Like button - always visible top-right */}
                <button
                    onClick={handleLike}
                    className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200 z-10 ${
                        isLiked 
                            ? 'bg-white text-red-500 shadow-md' 
                            : 'bg-white/80 text-[#4A3018]/60 hover:bg-white hover:text-red-500 shadow-sm'
                    }`}
                    data-testid={`like-button-${work.work_id}`}
                >
                    <Heart className={`w-5 h-5 transition-all duration-200 ${isLiked ? 'fill-red-500' : ''}`} />
                </button>
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent overlay-fade md:opacity-0 md:group-hover:opacity-100">
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <button
                            onClick={handleWhatsAppClick}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full py-2.5 font-medium text-sm hover:bg-[#20BD5A] transition-colors"
                            data-testid={`contact-button-${work.work_id}`}
                        >
                            <FaWhatsapp className="w-4 h-4" />
                            Contatta
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center bg-white/90 text-[#4A3018] rounded-full p-2.5 hover:bg-white transition-colors"
                            data-testid={`share-button-${work.work_id}`}
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Artisan info */}
            <div className="flex items-center gap-3 mt-3">
                <div 
                    onClick={handleArtisanClick}
                    className="cursor-pointer"
                    data-testid={`artisan-avatar-${work.work_id}`}
                >
                    <Avatar className="w-8 h-8 border border-[rgba(116,146,116,0.2)]">
                        <AvatarImage 
                            src={work.artisan_picture} 
                            alt={work.artisan_name} 
                        />
                        <AvatarFallback className="bg-[#749274] text-white text-xs">
                            {(work.artisan_name || 'A').charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <span 
                    onClick={handleArtisanClick}
                    className="text-sm font-semibold text-[#4A3018] hover:text-[#2E5339] transition-colors cursor-pointer"
                    data-testid={`artisan-name-${work.work_id}`}
                >
                    {work.artisan_name || 'Artigiano'}
                </span>
            </div>
        </div>
    );
};

export default WorkCard;
