import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FoodCard from "../../components/food/FoodCard";
import { Colors, Typography } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getFoodItems } from '../../services/firebaseService';

type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  FoodDetails: { foodId: string };
  Cart: undefined;
  Checkout: undefined;
  AdminDashboard: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFoodItems();
    
    // Set up real-time listener for food items
    const unsubscribe = subscribeToFoodItems((firebaseItems) => {
      // Map Firebase data to match FoodItem interface
      const mapped = (firebaseItems || []).map((firebaseItem) => ({
        id: firebaseItem.id,
        name: firebaseItem.name,
        description: firebaseItem.description,
        price: firebaseItem.price,
        category: firebaseItem.category as any,
        image: firebaseItem.image,
        ingredients: [], // Firebase doesn't have ingredients, use empty array
        sideOptions: [], // Firebase doesn't have side options, use empty array
        drinkOptions: [], // Firebase doesn't have drink options, use empty array
        extras: [], // Firebase doesn't have extras, use empty array
      }));
      setFoodItems(mapped);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const loadFoodItems = async () => {
    try {
      const result = await getFoodItems();
      if (result.success) {
        // Map Firebase data to match FoodItem interface
        const mapped = (result.data || []).map((firebaseItem) => ({
          id: firebaseItem.id,
          name: firebaseItem.name,
          description: firebaseItem.description,
          price: firebaseItem.price,
          category: firebaseItem.category as any,
          image: firebaseItem.image,
          ingredients: [], // Firebase doesn't have ingredients, use empty array
          sideOptions: [], // Firebase doesn't have side options, use empty array
          drinkOptions: [], // Firebase doesn't have drink options, use empty array
          extras: [], // Firebase doesn't have extras, use empty array
        }));
        setFoodItems(mapped);
      }
    } catch (error) {
      console.error("Error loading food items:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFoodItems();
    setRefreshing(false);
  };

  const getFilteredItems = () => {
    let filtered = Array.isArray(foodItems) ? foodItems : [];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };


  const categories = [
    { key: "all", label: "All" },
    { key: "mains", label: "Mains" },
    { key: "starters", label: "Starters" },
    { key: "desserts", label: "Desserts" },
    { key: "beverages", label: "Drinks" },
    { key: "burgers", label: "Burgers" },
  ];

  const handleFoodPress = (item: any) => {
    navigation.navigate("FoodDetails", { foodId: item.id });
  };

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      ingredients: item.ingredients,
      sideOptions: item.sideOptions,
      drinkOptions: item.drinkOptions,
      extras: item.extras,
      quantity: 1,
      selectedSides: [],
      selectedDrinks: [],
      selectedExtras: [],
      customIngredients: item.ingredients,
      totalPrice: item.price,
    });
  };

  const renderFoodItem = ({ item }: { item: any }) => (
    <FoodCard
      item={item}
      onPress={handleFoodPress}
      onAddToCart={handleAddToCart}
    />
  );

  const renderCategoryButton = (category: { key: string; label: string }) => (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.categoryButton,
        selectedCategory === category.key && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.key && styles.categoryButtonTextActive,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../../assets/images/background (2).png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good to see you!</Text>
            <Text style={styles.title}>
              {user?.name ? `Welcome, ${user.name}` : "Restaurant Menu"}
            </Text>
          </View>
          {user?.email === "admin@foodie.com" && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("AdminDashboard")}
            >
              <Ionicons name="settings" size={24} color={Colors.surface} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good to see you!</Text>
              <Text style={styles.title}>
                {user?.name ? `Welcome, ${user.name}` : "Restaurant Menu"}
              </Text>
            </View>
            {user?.email === "admin@foodie.com" && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate("AdminDashboard")}
              >
                <Ionicons name="settings" size={24} color={Colors.surface} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>

        {/* Search Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.textLight}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search delicious food..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Food List - Main Content */}
        <FlatList
          data={getFilteredItems() || []}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={styles.foodList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {getFilteredItems().length} {getFilteredItems().length === 1 ? 'Item' : 'Items'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant" size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>No food items found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: Typography.sm,
    color: Colors.surface,
    opacity: 0.9,
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: "800",
    color: Colors.surface,
    lineHeight: 38,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10)",
  },
  categoriesContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 5,
    minHeight: 40, // minimum height
    maxHeight: 60, // maximum height
    borderBottomWidth: 1,
    marginBottom: 20,
    borderBottomColor: Colors.overlayLight,
    backdropFilter: "blur(10)",
  },

  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.overlayLight,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
    maxWidth: 110,
    height: 50,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  categoryButtonText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: Typography.xs,
    maxWidth: 88,
    textAlign: "center",
  },
  categoryButtonTextActive: {
    color: Colors.surface,
    fontWeight: "700",
  },

  searchContainer: {
    marginTop: -20,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.overlayLight,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.text,
    paddingVertical: 14,
  },
  foodList: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: Typography.lg,
    color: Colors.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: Typography.base,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.overlayLight,
  },
  listHeaderText: {
    fontSize: Typography.base,
    color: Colors.text,
    fontWeight: "600",
  },
});
