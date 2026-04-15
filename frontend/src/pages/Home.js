import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilters from '../components/CategoryFilters';
import MasonryGrid from '../components/MasonryGrid';
import { Loader2 } from 'lucide-react';
import { DEMO_WORKS } from '../data/demoData';
import { useAuth } from '../contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Tutti');
    const [likedWorkIds, setLikedWorkIds] = useState([]);

    useEffect(() => {
        fetchWorks();
    }, [activeCategory]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMyLikes();
        }
    }, [isAuthenticated]);

    const fetchWorks = async () => {
        setLoading(true);
        try {
            const params = activeCategory !== 'Tutti' ? { category: activeCategory } : {};
            const response = await axios.get(`${API}/works`, { params });
            
            if (response.data.length === 0) {
                const filteredDemo = activeCategory === 'Tutti' 
                    ? DEMO_WORKS 
                    : DEMO_WORKS.filter(w => w.category === activeCategory);
                setWorks(filteredDemo);
            } else {
                setWorks(response.data);
            }
        } catch (error) {
            console.error('Error fetching works:', error);
            const filteredDemo = activeCategory === 'Tutti' 
                ? DEMO_WORKS 
                : DEMO_WORKS.filter(w => w.category === activeCategory);
            setWorks(filteredDemo);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyLikes = async () => {
        try {
            const response = await axios.get(`${API}/likes/my`, {
                withCredentials: true,
                headers: getAuthHeaders()
            });
            setLikedWorkIds(response.data);
        } catch (error) {
            // Not logged in or error
        }
    };

    const handleLikeToggle = (workId, liked) => {
        setLikedWorkIds(prev => 
            liked ? [...prev, workId] : prev.filter(id => id !== workId)
        );
    };

    return (
        <div className="min-h-screen bg-[#F9F6F0]" data-testid="home-page">
            <Header />
            
            {/* Hero Section */}
            <section className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8 pb-4">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#2E5339] text-center mb-3">
                    Scopri l'Artigianato Italiano
                </h1>
                <p className="text-[#7A5E46] text-center text-lg max-w-2xl mx-auto mb-6">
                    Una galleria dedicata ai creatori italiani. Esplora opere uniche fatte a mano con passione.
                </p>

                {/* Search Bar - between description and categories */}
                <SearchBar />
            </section>

            {/* Filters */}
            <section className="border-b border-[rgba(116,146,116,0.2)] mt-4">
                <div className="max-w-[1600px] mx-auto">
                    <CategoryFilters 
                        activeCategory={activeCategory} 
                        onCategoryChange={setActiveCategory} 
                    />
                </div>
            </section>

            {/* Works Grid */}
            <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-16" data-testid="loading-spinner">
                        <Loader2 className="w-8 h-8 animate-spin text-[#749274]" />
                    </div>
                ) : (
                    <MasonryGrid 
                        works={works} 
                        likedWorkIds={likedWorkIds}
                        onLikeToggle={handleLikeToggle}
                        emptyMessage="Nessuna opera in questa categoria. Sii il primo a pubblicare!"
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-[rgba(116,146,116,0.2)] bg-white/50">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 text-center">
                    <p className="text-[#7A5E46] text-sm">
                        © 2026 Cuore Artigiano - Una comunità per artigiani italiani
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
