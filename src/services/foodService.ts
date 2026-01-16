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
      name: 'Classic Beef Burger',
      description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce',
      price: 89.99,
      category: 'burgers',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9458c5967?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i1', name: 'Beef patty' },
        { id: 'i2', name: 'Lettuce', removable: true },
        { id: 'i3', name: 'Tomato', removable: true },
        { id: 'i4', name: 'Onion', removable: true },
        { id: 'i5', name: 'Special sauce' },
      ],
      sideOptions: [
        { id: 's1', name: 'French Fries', price: 0 },
        { id: 's2', name: 'Onion Rings', price: 25.50 },
        { id: 's3', name: 'Side Salad', price: 30.00 },
      ],
      drinkOptions: [
        { id: 'd1', name: 'Coca Cola', price: 25.50 },
        { id: 'd2', name: 'Orange Juice', price: 30.00 },
        { id: 'd3', name: 'Water', price: 15.50 },
      ],
      extras: [
        { id: 'e1', name: 'Extra Cheese', price: 15.50 },
        { id: 'e2', name: 'Bacon', price: 20.00 },
        { id: 'e3', name: 'Extra Patty', price: 30.00 },
        { id: 'e4', name: 'Avocado', price: 10.00 },
      ],
    },
    {
      id: '2',
      name: 'Grilled Chicken Breast',
      description: 'Tender grilled chicken breast with herbs and spices served with seasonal vegetables',
      price: 125.99,
      category: 'mains',
      image: 'https://images.unsplash.com/photo-1602744597446-1a9e0f0a5b6b?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i6', name: 'Chicken breast' },
        { id: 'i7', name: 'Herbs' },
        { id: 'i8', name: 'Spices' },
        { id: 'i9', name: 'Olive oil' },
        { id: 'i10', name: 'Seasonal vegetables' },
      ],
      sideOptions: [
        { id: 's4', name: 'Rice', price: 0 },
        { id: 's5', name: 'Grilled Vegetables', price: 20.00 },
        { id: 's6', name: 'Mashed Potatoes', price: 25.00 },
      ],
      drinkOptions: [
        { id: 'd4', name: 'Lemonade', price: 25.50 },
        { id: 'd5', name: 'Iced Tea', price: 20.00 },
        { id: 'd6', name: 'Fresh Juice', price: 35.00 },
      ],
      extras: [
        { id: 'e5', name: 'Extra Sauce', price: 5.50 },
        { id: 'e6', name: 'Side Salad', price: 30.00 },
        { id: 'e7', name: 'Garlic Bread', price: 25.00 },
      ],
    },
    {
      id: '3',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan cheese, croutons and homemade Caesar dressing',
      price: 75.99,
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1550309784-624f30030304?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i11', name: 'Romaine lettuce' },
        { id: 'i12', name: 'Parmesan cheese' },
        { id: 'i13', name: 'Croutons' },
        { id: 'i14', name: 'Caesar dressing' },
        { id: 'i15', name: 'Lemon juice' },
      ],
      sideOptions: [
        { id: 's7', name: 'Garlic Bread', price: 25.50 },
        { id: 's8', name: 'Soup of the Day', price: 35.00 },
      ],
      drinkOptions: [
        { id: 'd7', name: 'Mineral Water', price: 20.00 },
        { id: 'd8', name: 'White Wine', price: 65.00 },
      ],
      extras: [
        { id: 'e8', name: 'Grilled Chicken', price: 50.00 },
        { id: 'e9', name: 'Extra Dressing', price: 5.50 },
        { id: 'e10', name: 'Bacon Bits', price: 15.00 },
      ],
    },
    {
      id: '4',
      name: 'Chocolate Lava Cake',
      description: 'Rich chocolate cake with molten center and vanilla ice cream',
      price: 65.99,
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i16', name: 'Dark chocolate' },
        { id: 'i17', name: 'Butter' },
        { id: 'i18', name: 'Eggs' },
        { id: 'i19', name: 'Vanilla ice cream' },
        { id: 'i20', name: 'Powdered sugar' },
      ],
      sideOptions: [
        { id: 's9', name: 'Extra Ice Cream', price: 20.00 },
        { id: 's10', name: 'Fresh Berries', price: 25.00 },
      ],
      drinkOptions: [
        { id: 'd9', name: 'Coffee', price: 30.00 },
        { id: 'd10', name: 'Hot Chocolate', price: 25.50 },
        { id: 'd11', name: 'Cappuccino', price: 35.00 },
      ],
      extras: [
        { id: 'e11', name: 'Chocolate Sauce', price: 10.00 },
        { id: 'e12', name: 'Whipped Cream', price: 5.50 },
        { id: 'e13', name: 'Caramel Sauce', price: 10.00 },
      ],
    },
    {
      id: '5',
      name: 'Craft Beer Selection',
      description: 'Local brewery craft beer with hoppy notes and citrus finish',
      price: 45.99,
      category: 'alcohol',
      image: 'https://images.unsplash.com/photo-1608170531401-41dc3b0c9e85?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i21', name: 'Hops' },
        { id: 'i22', name: 'Malt' },
        { id: 'i23', name: 'Yeast' },
        { id: 'i24', name: 'Water' },
      ],
      sideOptions: [
        { id: 's11', name: 'Pretzels', price: 30.00 },
        { id: 's12', name: 'Beer Nuts', price: 25.00 },
      ],
      drinkOptions: [
        { id: 'd12', name: 'Craft Soda', price: 35.50 },
      ],
      extras: [
        { id: 'e14', name: 'Cheese Platter', price: 40.00 },
        { id: 'e15', name: 'Beer Flight', price: 85.00 },
      ],
    },
    {
      id: '6',
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomato sauce, and basil on crispy thin crust',
      price: 95.99,
      category: 'mains',
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i25', name: 'Mozzarella cheese' },
        { id: 'i26', name: 'Tomato sauce' },
        { id: 'i27', name: 'Fresh basil' },
        { id: 'i28', name: 'Olive oil' },
        { id: 'i29', name: 'Thin crust dough' },
      ],
      sideOptions: [
        { id: 's13', name: 'Garlic Bread', price: 25.50 },
        { id: 's14', name: 'Caesar Salad', price: 35.00 },
      ],
      drinkOptions: [
        { id: 'd13', name: 'Soft Drink', price: 25.50 },
        { id: 'd14', name: 'Mineral Water', price: 20.00 },
      ],
      extras: [
        { id: 'e16', name: 'Extra Cheese', price: 15.50 },
        { id: 'e17', name: 'Pepperoni', price: 20.00 },
        { id: 'e18', name: 'Mushrooms', price: 15.00 },
      ],
    },
    {
      id: '7',
      name: 'Fish & Chips',
      description: 'Crispy battered cod with golden fries and tartar sauce',
      price: 105.99,
      category: 'mains',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i30', name: 'Fresh cod' },
        { id: 'i31', name: 'Beer batter' },
        { id: 'i32', name: 'Potato fries' },
        { id: 'i33', name: 'Tartar sauce' },
        { id: 'i34', name: 'Lemon wedge' },
      ],
      sideOptions: [
        { id: 's15', name: 'Extra Fries', price: 20.00 },
        { id: 's16', name: 'Mushy Peas', price: 15.00 },
      ],
      drinkOptions: [
        { id: 'd15', name: 'Lemonade', price: 25.50 },
        { id: 'd16', name: 'Iced Tea', price: 20.00 },
      ],
      extras: [
        { id: 'e19', name: 'Extra Fish', price: 55.00 },
        { id: 'e20', name: 'Tartar Sauce', price: 5.50 },
      ],
    },
    {
      id: '8',
      name: 'Fresh Spring Rolls',
      description: 'Crispy vegetable spring rolls with sweet chili dipping sauce',
      price: 55.99,
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i35', name: 'Spring roll wrappers' },
        { id: 'i36', name: 'Mixed vegetables' },
        { id: 'i37', name: 'Rice noodles' },
        { id: 'i38', name: 'Sweet chili sauce' },
      ],
      sideOptions: [
        { id: 's17', name: 'Extra Dipping Sauce', price: 10.00 },
      ],
      drinkOptions: [
        { id: 'd17', name: 'Green Tea', price: 20.00 },
        { id: 'd18', name: 'Soda Water', price: 15.00 },
      ],
      extras: [
        { id: 'e21', name: 'Peanut Sauce', price: 10.00 },
        { id: 'e22', name: 'Extra Rolls', price: 25.00 },
      ],
    },
    {
      id: '9',
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
      price: 60.99,
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d21ea2b9e8?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i39', name: 'Ladyfinger cookies' },
        { id: 'i40', name: 'Mascarpone cheese' },
        { id: 'i41', name: 'Espresso coffee' },
        { id: 'i42', name: 'Cocoa powder' },
        { id: 'i43', name: 'Dark chocolate' },
      ],
      sideOptions: [
        { id: 's18', name: 'Espresso Shot', price: 20.00 },
      ],
      drinkOptions: [
        { id: 'd19', name: 'Espresso', price: 25.00 },
        { id: 'd20', name: 'Cappuccino', price: 35.00 },
      ],
      extras: [
        { id: 'e23', name: 'Extra Cocoa', price: 5.50 },
        { id: 'e24', name: 'Chocolate Shavings', price: 10.00 },
      ],
    },
    {
      id: '10',
      name: 'Wine Selection',
      description: 'Premium South African wine with rich berry notes',
      price: 155.99,
      category: 'alcohol',
      image: 'https://images.unsplash.com/photo-1510812432875-a7626febd5eb?w=400&h=300&fit=crop',
      ingredients: [
        { id: 'i44', name: 'Premium grapes' },
        { id: 'i45', name: 'Oak aging' },
        { id: 'i46', name: 'Natural yeast' },
      ],
      sideOptions: [
        { id: 's19', name: 'Cheese Board', price: 45.00 },
        { id: 's20', name: 'Charcuterie', price: 55.00 },
      ],
      drinkOptions: [
        { id: 'd21', name: 'Water', price: 15.00 },
      ],
      extras: [
        { id: 'e25', name: 'Wine Tasting Flight', price: 95.00 },
        { id: 'e26', name: 'Gourmet Olives', price: 25.00 },
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
