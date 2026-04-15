import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    const debounceTimer = { current: null };

    const searchArtisans = useCallback(async (q) => {
        if (q.length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }
        
        setSearching(true);
        try {
            const response = await axios.get(`${API}/search/artisans`, { params: { q } });
            setResults(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        
        // Debounce search
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => searchArtisans(value), 300);
    };

    const handleSelectArtisan = (userId) => {
        setShowResults(false);
        setQuery('');
        navigate(`/artisan/${userId}`);
    };

    const handleBlur = () => {
        // Delay to allow click on results
        setTimeout(() => setShowResults(false), 200);
    };

    return (
        <div className="relative w-full max-w-xl mx-auto" data-testid="search-bar-container">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5E46]" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => { if (results.length > 0) setShowResults(true); }}
                    onBlur={handleBlur}
                    placeholder="Cerca artigiani per nome..."
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-[rgba(116,146,116,0.25)] rounded-full text-[#4A3018] placeholder:text-[#7A5E46]/60 focus:outline-none focus:border-[#749274] focus:ring-2 focus:ring-[#749274]/20 transition-all shadow-soft"
                    data-testid="search-input"
                />
                {searching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#749274] animate-spin" />
                )}
            </div>

            {/* Results dropdown */}
            {showResults && results.length > 0 && (
                <div 
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[rgba(116,146,116,0.15)] overflow-hidden z-50"
                    data-testid="search-results"
                >
                    {results.map((artisan) => (
                        <button
                            key={artisan.user_id}
                            onClick={() => handleSelectArtisan(artisan.user_id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F9F6F0] transition-colors text-left"
                            data-testid={`search-result-${artisan.user_id}`}
                        >
                            <Avatar className="w-10 h-10 border border-[rgba(116,146,116,0.2)]">
                                <AvatarImage 
                                    src={artisan.profile_image || artisan.picture} 
                                    alt={artisan.brand_name || artisan.name} 
                                />
                                <AvatarFallback className="bg-[#749274] text-white text-sm">
                                    {(artisan.brand_name || artisan.name || 'A').charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-[#4A3018] text-sm">
                                    {artisan.brand_name || artisan.name}
                                </p>
                                {artisan.bio && (
                                    <p className="text-xs text-[#7A5E46] line-clamp-1">
                                        {artisan.bio}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showResults && query.length >= 2 && results.length === 0 && !searching && (
                <div 
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[rgba(116,146,116,0.15)] p-4 text-center z-50"
                    data-testid="search-no-results"
                >
                    <p className="text-[#7A5E46] text-sm">Nessun artigiano trovato</p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
