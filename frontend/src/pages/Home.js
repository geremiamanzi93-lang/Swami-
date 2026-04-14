import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import CategoryFilters from '../components/CategoryFilters';
import MasonryGrid from '../components/MasonryGrid';
import { Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Demo works for initial display
const DEMO_WORKS = [
    {
        work_id: 'demo_1',
        user_id: 'demo_user_1',
        title: 'Orecchini in Ceramica Blu',
        description: 'Orecchini artigianali in ceramica dipinta a mano',
        category: 'Orecchini',
        image_path: 'https://images.unsplash.com/photo-1609252908235-20aeac3bbf8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=600',
        created_at: new Date().toISOString(),
        artisan_name: 'Ceramiche di Luna',
        artisan_picture: 'https://images.unsplash.com/photo-1768478563696-ca21b9692a8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        artisan_whatsapp: ''
    },
    {
        work_id: 'demo_2',
        user_id: 'demo_user_2',
        title: 'Borsa all\'Uncinetto Multicolor',
        description: 'Borsa fatta a mano con filati naturali',
        category: 'Borse',
        image_path: 'https://images.unsplash.com/photo-1770637266187-60cf9d509593?crop=entropy&cs=srgb&fm=jpg&q=85&w=600',
        created_at: new Date().toISOString(),
        artisan_name: 'Intrecci di Filo',
        artisan_picture: 'https://images.unsplash.com/photo-1673103622378-62e9a29f71f2?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        artisan_whatsapp: ''
    },
    {
        work_id: 'demo_3',
        user_id: 'demo_user_3',
        title: 'Scacciapensieri in Legno',
        description: 'Scacciapensieri artigianale con elementi naturali',
        category: 'Scacciapensieri',
        image_path: 'https://images.unsplash.com/photo-1767608551302-1db76f601c38?crop=entropy&cs=srgb&fm=jpg&q=85&w=600',
        created_at: new Date().toISOString(),
        artisan_name: 'Vento & Suono',
        artisan_picture: 'https://images.pexels.com/photos/33762784/pexels-photo-33762784.jpeg?auto=compress&cs=tinysrgb&w=150',
        artisan_whatsapp: ''
    },
    {
        work_id: 'demo_4',
        user_id: 'demo_user_4',
        title: 'Borsa Crochet Colorata',
        description: 'Borsa realizzata interamente all\'uncinetto',
        category: 'Uncinetto',
        image_path: 'https://images.pexels.com/photos/33853684/pexels-photo-33853684.jpeg?auto=compress&cs=tinysrgb&w=600',
        created_at: new Date().toISOString(),
        artisan_name: 'Mani d\'Oro',
        artisan_picture: 'https://images.unsplash.com/photo-1743807059766-9d3ca4f35b60?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        artisan_whatsapp: ''
    },
    {
        work_id: 'demo_5',
        user_id: 'demo_user_1',
        title: 'Ciondolo in Ceramica',
        description: 'Ciondolo decorativo dipinto a mano',
        category: 'Ciondoli',
        image_path: 'https://images.unsplash.com/photo-1609252907817-fad418fb02ed?crop=entropy&cs=srgb&fm=jpg&q=85&w=600',
        created_at: new Date().toISOString(),
        artisan_name: 'Ceramiche di Luna',
        artisan_picture: 'https://images.unsplash.com/photo-1768478563696-ca21b9692a8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        artisan_whatsapp: ''
    },
    {
        work_id: 'demo_6',
        user_id: 'demo_user_2',
        title: 'Collana con Perle',
        description: 'Collana elegante con perle naturali',
        category: 'Collane',
        image_path: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?crop=entropy&cs=srgb&fm=jpg&q=85&w=600',
        created_at: new Date().toISOString(),
        artisan_name: 'Intrecci di Filo',
        artisan_picture: 'https://images.unsplash.com/photo-1673103622378-62e9a29f71f2?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        artisan_whatsapp: ''
    }
];

const Home = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Tutti');

    useEffect(() => {
        fetchWorks();
    }, [activeCategory]);

    const fetchWorks = async () => {
        setLoading(true);
        try {
            const params = activeCategory !== 'Tutti' ? { category: activeCategory } : {};
            const response = await axios.get(`${API}/works`, { params });
            
            // If no real works, show demo works
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
            // Show demo works on error
            const filteredDemo = activeCategory === 'Tutti' 
                ? DEMO_WORKS 
                : DEMO_WORKS.filter(w => w.category === activeCategory);
            setWorks(filteredDemo);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F6F0]" data-testid="home-page">
            <Header />
            
            {/* Hero Section */}
            <section className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8 pb-4">
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#2E5339] text-center mb-3">
                    Scopri l'Artigianato Italiano
                </h1>
                <p className="text-[#7A5E46] text-center text-lg max-w-2xl mx-auto">
                    Una galleria dedicata ai creatori italiani. Esplora opere uniche fatte a mano con passione.
                </p>
            </section>

            {/* Filters */}
            <section className="border-b border-[rgba(116,146,116,0.2)]">
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
