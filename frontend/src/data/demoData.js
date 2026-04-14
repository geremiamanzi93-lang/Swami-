// Demo data for initial display when no real works exist

export const DEMO_WORKS = [
    {
        work_id: 'demo_1',
        user_id: 'demo_user_1',
        title: 'Orecchini in Ceramica Blu',
        description: 'Orecchini artigianali in ceramica dipinta a mano con motivi floreali unici. Ogni pezzo è un\'opera d\'arte.',
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
        description: 'Borsa fatta a mano con filati naturali di alta qualità. Colori vivaci e design unico.',
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
        description: 'Scacciapensieri artigianale con elementi naturali raccolti nei boschi italiani.',
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
        description: 'Borsa realizzata interamente all\'uncinetto con tecnica tradizionale italiana.',
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
        description: 'Ciondolo decorativo dipinto a mano con smalti naturali.',
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
        description: 'Collana elegante con perle naturali selezionate a mano.',
        category: 'Collane',
        image_path: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?crop=entropy&cs=srgb&fm=jpg&q=85&w=600',
        created_at: new Date().toISOString(),
        artisan_name: 'Intrecci di Filo',
        artisan_picture: 'https://images.unsplash.com/photo-1673103622378-62e9a29f71f2?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        artisan_whatsapp: ''
    }
];

export const DEMO_ARTISANS = {
    'demo_user_1': {
        user_id: 'demo_user_1',
        email: 'ceramiche@example.com',
        name: 'Ceramiche di Luna',
        brand_name: 'Ceramiche di Luna',
        picture: 'https://images.unsplash.com/photo-1768478563696-ca21b9692a8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        profile_image: 'https://images.unsplash.com/photo-1768478563696-ca21b9692a8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        bio: 'Creo gioielli e oggetti decorativi in ceramica nel mio laboratorio in Toscana. Ogni pezzo è unico e racconta una storia.',
        whatsapp: ''
    },
    'demo_user_2': {
        user_id: 'demo_user_2',
        email: 'intrecci@example.com',
        name: 'Intrecci di Filo',
        brand_name: 'Intrecci di Filo',
        picture: 'https://images.unsplash.com/photo-1673103622378-62e9a29f71f2?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        profile_image: 'https://images.unsplash.com/photo-1673103622378-62e9a29f71f2?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        bio: 'Artigiana tessile specializzata in creazioni all\'uncinetto e macramè. Uso solo filati naturali e sostenibili.',
        whatsapp: ''
    },
    'demo_user_3': {
        user_id: 'demo_user_3',
        email: 'vento@example.com',
        name: 'Vento & Suono',
        brand_name: 'Vento & Suono',
        picture: 'https://images.pexels.com/photos/33762784/pexels-photo-33762784.jpeg?auto=compress&cs=tinysrgb&w=150',
        profile_image: 'https://images.pexels.com/photos/33762784/pexels-photo-33762784.jpeg?auto=compress&cs=tinysrgb&w=150',
        bio: 'Creo scacciapensieri e oggetti sonori utilizzando materiali naturali raccolti nei boschi dell\'Appennino.',
        whatsapp: ''
    },
    'demo_user_4': {
        user_id: 'demo_user_4',
        email: 'mani@example.com',
        name: 'Mani d\'Oro',
        brand_name: 'Mani d\'Oro',
        picture: 'https://images.unsplash.com/photo-1743807059766-9d3ca4f35b60?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        profile_image: 'https://images.unsplash.com/photo-1743807059766-9d3ca4f35b60?crop=entropy&cs=srgb&fm=jpg&q=85&w=150',
        bio: 'Nonna artigiana che tramanda l\'arte dell\'uncinetto da tre generazioni. Ogni creazione è fatta con amore.',
        whatsapp: ''
    }
};

export const getDemoWork = (workId) => {
    return DEMO_WORKS.find(w => w.work_id === workId) || null;
};

export const getDemoArtisan = (userId) => {
    return DEMO_ARTISANS[userId] || null;
};

export const getDemoWorksByUser = (userId) => {
    return DEMO_WORKS.filter(w => w.user_id === userId);
};
