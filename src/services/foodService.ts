export interface SideOption {
  id: string;
  name: string;
  price: number;
}

export interface DrinkOption {
  id: string;
  name: string;
  price: number;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Ingredient {
  id: string;
  name: string;
  removable?: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'mains' | 'starters' | 'desserts' | 'beverages' | 'alcohol' | 'burgers';
  image: string;
  ingredients: Ingredient[];
  sideOptions?: SideOption[];
  drinkOptions?: DrinkOption[];
  extras: Extra[];
}

export interface CartItem extends FoodItem {
  quantity: number;
  selectedSides?: SideOption[];
  selectedDrinks?: DrinkOption[];
  selectedExtras?: Extra[];
  customIngredients?: Ingredient[];
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

class FoodService {
  private foodItems: FoodItem[] = [
    {
      id: '1',
      name: 'Classic Burger',
      description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce',
      price: 12.99,
      category: 'burgers',
      image: 'https://via.placeholder.com/150/150/FF6B6B/FFFFFF?text=Burger',
      ingredients: [
        { id: 'i1', name: 'Beef patty' },
        { id: 'i2', name: 'Lettuce', removable: true },
        { id: 'i3', name: 'Tomato', removable: true },
        { id: 'i4', name: 'Onion', removable: true },
        { id: 'i5', name: 'Special sauce' },
      ],
      sideOptions: [
        { id: 's1', name: 'French Fries', price: 0 },
        { id: 's2', name: 'Onion Rings', price: 2.50 },
        { id: 's3', name: 'Side Salad', price: 3.00 },
      ],
      drinkOptions: [
        { id: 'd1', name: 'Coca Cola', price: 2.50 },
        { id: 'd2', name: 'Orange Juice', price: 3.00 },
        { id: 'd3', name: 'Water', price: 1.50 },
      ],
      extras: [
        { id: 'e1', name: 'Extra Cheese', price: 1.50 },
        { id: 'e2', name: 'Bacon', price: 2.00 },
        { id: 'e3', name: 'Extra Patty', price: 3.00 },
        { id: 'e4', name: 'Avocado', price: 1.00 },
      ],
    },
    {
      id: '2',
      name: 'Grilled Chicken',
      description: 'Tender grilled chicken breast with herbs and spices',
      price: 15.99,
      category: 'mains',
      image: 'https://via.placeholder.com/150/150/FF6B6B/FFFFFF?text=Chicken',
      ingredients: [
        { id: 'i6', name: 'Chicken breast' },
        { id: 'i7', name: 'Herbs' },
        { id: 'i8', name: 'Spices' },
      ],
      sideOptions: [
        { id: 's4', name: 'Rice', price: 0 },
        { id: 's5', name: 'Grilled Vegetables', price: 2.00 },
      ],
      drinkOptions: [
        { id: 'd4', name: 'Lemonade', price: 2.50 },
        { id: 'd5', name: 'Iced Tea', price: 2.00 },
      ],
      extras: [
        { id: 'e5', name: 'Extra Sauce', price: 0.50 },
        { id: 'e6', name: 'Side Salad', price: 3.00 },
      ],
    },
    {
      id: '3',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan cheese and croutons',
      price: 9.99,
      category: 'starters',
      image: 'https://via.placeholder.com/150/150/90EE90/FFFFFF?text=Salad',
      ingredients: [
        { id: 'i9', name: 'Romaine lettuce' },
        { id: 'i10', name: 'Parmesan cheese' },
        { id: 'i11', name: 'Croutons' },
        { id: 'i12', name: 'Caesar dressing' },
      ],
      sideOptions: [
        { id: 's6', name: 'Garlic Bread', price: 2.50 },
      ],
      drinkOptions: [
        { id: 'd6', name: 'Mineral Water', price: 2.00 },
      ],
      extras: [
        { id: 'e7', name: 'Grilled Chicken', price: 5.00 },
        { id: 'e8', name: 'Extra Dressing', price: 0.50 },
      ],
    },
    {
      id: '4',
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with vanilla frosting',
      price: 6.99,
      category: 'desserts',
      image: 'https://via.placeholder.com/150/150/8B4513/FFFFFF?text=Cake',
      ingredients: [
        { id: 'i13', name: 'Chocolate' },
        { id: 'i14', name: 'Vanilla frosting' },
      ],
      sideOptions: [
        { id: 's7', name: 'Ice Cream', price: 2.00 },
      ],
      drinkOptions: [
        { id: 'd7', name: 'Coffee', price: 3.00 },
        { id: 'd8', name: 'Hot Chocolate', price: 2.50 },
      ],
      extras: [
        { id: 'e9', name: 'Chocolate Sauce', price: 1.00 },
        { id: 'e10', name: 'Whipped Cream', price: 0.50 },
      ],
    },
    {
      id: '5',
      name: 'Craft Beer',
      description: 'Local brewery craft beer with hoppy notes',
      price: 5.99,
      category: 'alcohol',
      image: 'https://via.placeholder.com/150/150/FFB84D/FFFFFF?text=Beer',
      ingredients: [
        { id: 'i15', name: 'Hops' },
        { id: 'i16', name: 'Malt' },
        { id: 'i17', name: 'Yeast' },
        { id: 'i18', name: 'Water' },
      ],
      sideOptions: [
        { id: 's8', name: 'Pretzels', price: 3.00 },
      ],
      drinkOptions: [
        { id: 'd9', name: 'Craft Soda', price: 3.50 },
      ],
      extras: [
        { id: 'e11', name: 'Beer Nuts', price: 2.50 },
        { id: 'e12', name: 'Cheese Platter', price: 4.00 },
      ],
    },
  ];

  getAllFoodItems(): FoodItem[] {
    return this.foodItems;
  }

  getFoodItemById(id: string): FoodItem | undefined {
    return this.foodItems.find(item => item.id === id);
  }

  getFoodItemsByCategory(category: string): FoodItem[] {
    return this.foodItems.filter(item => item.category === category);
  }

  getCategories(): { key: string; label: string }[] {
    return [
      { key: 'mains', label: 'Mains' },
      { key: 'starters', label: 'Starters' },
      { key: 'desserts', label: 'Desserts' },
      { key: 'beverages', label: 'Beverages' },
      { key: 'alcohol', label: 'Alcohol' },
      { key: 'burgers', label: 'Burgers' },
    ];
  }
}

export const foodService = new FoodService();
