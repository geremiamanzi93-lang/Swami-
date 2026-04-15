import Masonry from 'react-masonry-css';
import WorkCard from './WorkCard';

const breakpointColumns = {
    default: 5,
    1536: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 2
};

const MasonryGrid = ({ works, likedWorkIds = [], onLikeToggle, emptyMessage = "Nessuna opera trovata" }) => {
    if (!works || works.length === 0) {
        return (
            <div 
                className="flex flex-col items-center justify-center py-16 px-4"
                data-testid="empty-grid"
            >
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-[#7A5E46] text-lg text-center">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
            data-testid="masonry-grid"
        >
            {works.map((work) => (
                <WorkCard 
                    key={work.work_id} 
                    work={work} 
                    isLiked={likedWorkIds.includes(work.work_id)}
                    onLikeToggle={onLikeToggle}
                />
            ))}
        </Masonry>
    );
};

export default MasonryGrid;
