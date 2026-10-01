export interface SlideItem {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  content: string;
  action_url: string;
  button_text?: string;
  badge?: string;
}

export interface CategoryItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface ProductSizeItem {
  size: string;
  qty: number;
  in_stock: boolean;
}

export interface ProductItem {
  id: number;
  slug: string;
  title: string;
  category_id: number;
  category_name: string;
  price: number;
  original_price: number;
  rating: number;
  review_count: number;
  images: string[];
  description: string;
  short_desc?: string;
  badge?: 'SALE' | 'HOT' | 'NEW' | 'TRENDING';
  in_stock: boolean;
  colors?: string[];
  sizes: ProductSizeItem[];
  is_featured?: boolean;
}

export const DUMMY_SLIDERS: SlideItem[] = [
  {
    id: 1,
    image: '/img/sandals_banner.jpg',
    title: 'Artisan Comfort Sandal & Slider Archive',
    subtitle: 'Coordinates in Color & Ergonomic Support',
    content: 'Handcrafted suede & genuine leather buckled sliders, T-strap sandals, and contoured memory-foam footbeds available in vibrant earth tones.',
    action_url: '/shop?category=men-footwear',
    button_text: 'Explore Sandal Collection',
    badge: 'LATEST COLLECTION 2026'
  },
  {
    id: 2,
    image: '/img/slide_1.jpg',
    title: 'Gulmohar Luxury Footwear',
    subtitle: 'Step Into Comfort, Walk in Style',
    content: 'Discover handcrafted pure leather formal shoes, breathable lifestyle sneakers, and royal evening heels engineered with memory foam cushioning.',
    action_url: '/shop',
    button_text: 'Explore All Footwear',
    badge: 'NEW FOOTWEAR 2026'
  },
  {
    id: 3,
    image: '/img/slide_2.jpg',
    title: 'Festive & Bridal Footwear Gala',
    subtitle: 'Up to 50% Off Top Styles',
    content: 'Elevate your grand occasions with stiletto pumps, hand-embroidered wedding mojaris, and Italian leather dress shoes.',
    action_url: '/shop?category=women-footwear',
    button_text: 'Shop Women’s Heels',
    badge: 'FESTIVE SALE'
  }
];

export const DUMMY_CATEGORIES: CategoryItem[] = [
  {
    id: 1,
    slug: 'men-footwear',
    title: 'Men’s Footwear',
    description: 'Formal oxfords, leather loafers, Chelsea boots & active sneakers',
    image: '/img/men-large.jpg',
    itemCount: 42
  },
  {
    id: 2,
    slug: 'women-footwear',
    title: 'Women’s Footwear',
    description: 'Stiletto heels, block pumps, bridal juttis, flats & mules',
    image: '/img/women-large.jpg',
    itemCount: 56
  },
  {
    id: 3,
    slug: 'kids-footwear',
    title: "Kid's Footwear",
    description: 'Lightweight sports sneakers, school shoes & party ballerinas',
    image: '/img/banner-3.png',
    itemCount: 28
  },
  {
    id: 4,
    slug: 'ethnic-footwear',
    title: 'Artisan & Ethnic Mojaris',
    description: 'Handcrafted pure leather Kolhapuris, wedding juttis & slip-ons',
    image: '/img/products/blackheels.jpg',
    itemCount: 35
  }
];

export const DUMMY_PRODUCTS: ProductItem[] = [];

export const DUMMY_REVIEWS = [
  {
    id: 1,
    name: 'Vikramaditya Rathore',
    rating: 5,
    date: '2 days ago',
    comment: 'The craftsmanship of the London Chelsea boots is world-class. The memory foam insole makes 8 hours of walking completely effortless!'
  },
  {
    id: 2,
    name: 'Ananya Deshmukh',
    rating: 5,
    date: '1 week ago',
    comment: 'Ordered the Royal Stiletto heels in UK 5. The fit is perfect according to the size chart, and the heels are super sturdy without wobbling.'
  },
  {
    id: 3,
    name: 'Harsh Vardhan',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Great feature showing which sizes are in stock with exact quantity remaining! Got the last pair of UK 8 slip-ons. Prompt 48h delivery.'
  }
];
