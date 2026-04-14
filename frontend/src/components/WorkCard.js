import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { Share2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WorkCard = ({ work }) => {
    const imageUrl = work.image_path?.startsWith('http') 
        ? work.image_path 
        : `${API}/files/${work.image_path}`;
    
    const handleWhatsAppClick = (e) => {
        e.preventDefault();
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
        e.preventDefault();
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
            // Fallback: share on WhatsApp
            const waText = encodeURIComponent(`${shareText} ${shareUrl}`);
            window.open(`https://wa.me/?text=${waText}`, '_blank');
        }
    };

    return (
        <div 
            className="break-inside-avoid mb-6 group"
            data-testid={`work-card-${work.work_id}`}
        >
            <Link to={`/work/${work.work_id}`}>
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
                    <Link 
                        to={`/artisan/${work.user_id}`}
                        onClick={(e) => e.stopPropagation()}
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
                    </Link>
                    <Link 
                        to={`/artisan/${work.user_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-semibold text-[#4A3018] hover:text-[#2E5339] transition-colors"
                        data-testid={`artisan-name-${work.work_id}`}
                    >
                        {work.artisan_name || 'Artigiano'}
                    </Link>
                </div>
            </Link>
        </div>
    );
};

export default WorkCard;
