const CATEGORIES = [
    'Tutti',
    'Orecchini',
    'Collane',
    'Ciondoli',
    'Borse',
    'Ciondoli per capelli',
    'Scacciapensieri',
    'Uncinetto'
];

const CategoryFilters = ({ activeCategory, onCategoryChange }) => {
    return (
        <div className="w-full overflow-x-auto hide-scrollbar py-4">
            <div className="flex gap-3 min-w-max px-4 md:px-8">
                {CATEGORIES.map((category) => {
                    const isActive = activeCategory === category;
                    return (
                        <button
                            key={category}
                            onClick={() => onCategoryChange(category)}
                            className={`
                                filter-pill px-5 py-2.5 rounded-full font-medium text-sm
                                transition-all duration-200
                                ${isActive 
                                    ? 'bg-[#2E5339] text-white shadow-soft' 
                                    : 'border border-[rgba(116,146,116,0.2)] text-[#7A5E46] hover:border-[#749274] hover:text-[#4A3018]'
                                }
                            `}
                            data-testid={`filter-button-${category.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export { CATEGORIES };
export default CategoryFilters;
