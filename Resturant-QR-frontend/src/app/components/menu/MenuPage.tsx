import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { CartItem, Food } from '../../../types';
import { api, DEFAULT_FOOD_IMAGE } from '../../lib/api';
import { resolveImageUrl } from '../../lib/image';
import { FoodCard } from './FoodCard';
import { Cart } from './Cart';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { MenuLoadingSkeleton } from './LoadingSkeleton';
import { AnimatePresence, motion } from 'motion/react';
import { QrCode, Search, ShoppingBag, Sparkles, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';

interface MenuPageProps {
  tableNumber?: number;
}

type CartActivity = {
  id: number;
  label: string;
  subtitle: string;
  image?: string;
};

const RECENT_ADD_TIMEOUT = 1400;
const CART_ACTIVITY_TIMEOUT = 2200;

export function MenuPage({ tableNumber }: MenuPageProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [isLoading, setIsLoading] = useState(true);
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<string[]>(['Barchasi']);
  const [highlightToken, setHighlightToken] = useState(0);
  const [lastAddedLabel, setLastAddedLabel] = useState('');
  const [recentlyAddedFoodId, setRecentlyAddedFoodId] = useState<number | null>(null);
  const [cartActivity, setCartActivity] = useState<CartActivity | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const mapFood = (food: any, categoryName: string): Food => ({
    ...food,
    price: Number(food.price || 0),
    categoryName,
    nameUz: food.name,
    descriptionUz: food.description || '',
    image: resolveImageUrl(food.imageUrl, DEFAULT_FOOD_IMAGE),
    categoryUz: categoryName,
    available: food.isAvailable ?? true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.menu();
        const nextFoods = (response.categories || []).flatMap((category: any) =>
          (category.foods || []).map((food: any) => mapFood(food, category.name))
        );

        setFoods(nextFoods);
        setCategories([
          'Barchasi',
          ...Array.from(new Set(nextFoods.map((food) => food.categoryUz || '').filter(Boolean))),
        ]);
      } catch (error: any) {
        toast.error("Menyuni yuklashda xatolik yuz berdi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!recentlyAddedFoodId) return;

    const timer = window.setTimeout(() => setRecentlyAddedFoodId(null), RECENT_ADD_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [recentlyAddedFoodId]);

  useEffect(() => {
    if (!cartActivity) return;

    const timer = window.setTimeout(() => setCartActivity(null), CART_ACTIVITY_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [cartActivity]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const normalizedDeferredSearch = deferredSearchQuery.toLowerCase();
      const matchesSearch =
        (food.nameUz || food.name || '').toLowerCase().includes(normalizedDeferredSearch) ||
        (food.descriptionUz || food.description || '').toLowerCase().includes(normalizedDeferredSearch);
      const matchesCategory =
        selectedCategory === 'Barchasi' || food.categoryUz === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [deferredSearchQuery, foods, selectedCategory]);

  const featuredFoods = useMemo(() => {
    const availableFoods = foods.filter((food) => food.available !== false);
    return availableFoods.slice(0, 3);
  }, [foods]);

  const cartTotals = useMemo(() => {
    return cart.reduce(
      (summary, item) => {
        summary.items += item.quantity;
        summary.total += item.food.price * item.quantity;
        return summary;
      },
      { items: 0, total: 0 }
    );
  }, [cart]);

  const pushCartFeedback = (label: string, subtitle: string, image?: string) => {
    const token = Date.now();
    setHighlightToken(token);
    setLastAddedLabel(label);
    setCartActivity({
      id: token,
      label,
      subtitle,
      image,
    });
  };

  const mergeFoodIntoCart = (food: Food, quantity = 1) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.food.id === food.id);
      if (existing) {
        return previous.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...previous, { food, quantity }];
    });
  };

  const handleAddToCart = (food: Food) => {
    mergeFoodIntoCart(food, 1);
    setRecentlyAddedFoodId(food.id);
    pushCartFeedback(food.nameUz || food.name, "Savatga qo'shildi", food.image);
    toast.success(`${food.nameUz || food.name} savatga qo'shildi`);
  };

  const handleRemoveFromCart = (food: Food) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.food.id === food.id);
      if (!existing) return previous;

      if (existing.quantity === 1) {
        return previous.filter((item) => item.food.id !== food.id);
      }

      return previous.map((item) =>
        item.food.id === food.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const handleClearItem = (foodId: number) => {
    setCart((previous) => previous.filter((item) => item.food.id !== foodId));
    toast.info('Mahsulot savatdan olib tashlandi');
  };

  const handleCheckout = async (): Promise<boolean> => {
    if (cart.length === 0) {
      toast.info("Savatcha hali bo'sh");
      return false;
    }

    if (!tableNumber) {
      toast.error('Buyurtma berish uchun stol QR kodini skaner qiling');
      return false;
    }

    try {
      await api.createOrder({
        tableNumber,
        items: cart.map((item) => ({
          foodId: item.food.id,
          quantity: item.quantity,
        })),
      });

      toast.success("Buyurtmangiz qabul qilindi. Oshxona tayyorlashni boshladi.");
      setCart([]);
      setLastAddedLabel('');
      setCartActivity({
        id: Date.now(),
        label: 'Buyurtma yuborildi',
        subtitle: `Stol #${tableNumber} uchun oshxonaga uzatildi`,
      });
      return true;
    } catch (error: any) {
      toast.error(error.message || "Buyurtma berishda xatolik yuz berdi");
      return false;
    }
  };

  const getQuantityInCart = (foodId: number) =>
    cart.find((item) => item.food.id === foodId)?.quantity || 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 opacity-20 mix-blend-multiply blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -left-10 bottom-0 h-80 w-80 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 opacity-30 mix-blend-multiply blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="sticky top-0 z-40 border-b border-orange-100 bg-white/80 shadow-lg backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            className="mb-6 flex items-center justify-between gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="relative rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 shadow-xl"
                whileHover={{ rotate: 360, scale: 1.08 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-orange-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.45, 0, 0.45] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <UtensilsCrossed className="relative z-10 h-8 w-8 text-white" />
              </motion.div>

              <div>
                <motion.h1
                  className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-3xl font-bold text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  Restoran Menu
                </motion.h1>
                <motion.div
                  className="mt-1 flex flex-wrap items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {tableNumber ? (
                    <Badge className="border-none bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                      Stol #{tableNumber}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-200 text-orange-700">
                      QR skanerdan keyin stol avtomatik aniqlanadi
                    </Badge>
                  )}
                </motion.div>
              </div>
            </div>

            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.18, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-10 w-10 text-yellow-500 drop-shadow-lg" />
            </motion.div>
          </motion.div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <Search className="absolute left-4 top-1/2 z-20 h-5 w-5 -translate-y-1/2 text-orange-400" />
            <Input
              type="text"
              placeholder="Ovqat qidiring..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 rounded-xl border-2 border-orange-200 bg-white pl-12 shadow-sm transition-all duration-300 focus:scale-[1.01] focus:border-orange-400 focus:shadow-lg"
            />
          </motion.div>
        </div>
      </div>

      <div className="sticky top-[140px] z-30 border-b border-orange-100 bg-white/65 shadow-none backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="scrollbar-hide flex gap-3 overflow-x-auto py-1 pb-2">
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  type="button"
                  className={`relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold outline-none transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl'
                      : 'border-2 border-orange-200 bg-white text-slate-700 shadow-sm hover:border-orange-300 hover:bg-orange-50'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {selectedCategory === category && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-full bg-orange-400"
                      layoutId="activeCategory"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className={`relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${cartTotals.items > 0 ? 'pb-32 md:pb-10' : ''}`}>
        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MenuLoadingSkeleton />
          </motion.div>
        ) : (
          <>
            <motion.div
              className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-900 p-6 text-white shadow-2xl lg:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="border border-white/10 bg-white/10 text-white">
                    <QrCode className="mr-2 h-4 w-4" />
                    QR menu flow
                  </Badge>
                  <Badge className="border border-emerald-300/20 bg-emerald-400/10 text-emerald-100">
                    Savat doim ko'rinadi
                  </Badge>
                </div>

                <div className="mt-5 max-w-2xl">
                  <h2 className="text-3xl font-bold leading-tight lg:text-4xl">
                    Skanerdan keyin ko'rinadigan menyu va tez savat oqimi
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-orange-100/80 lg:text-base">
                    Mijoz menyuni ko'radi, mahsulotni savatga qo'shadi va checkout tugmasi
                    mobil qurilmada ham doim ko'rinib turadi.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <p className="text-sm text-orange-100/70">Menyudagi taom</p>
                    <p className="mt-2 text-2xl font-bold">{foods.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <p className="text-sm text-orange-100/70">Kategoriya</p>
                    <p className="mt-2 text-2xl font-bold">{Math.max(categories.length - 1, 0)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                    <p className="text-sm text-orange-100/70">Savat holati</p>
                    <p className="mt-2 text-2xl font-bold">{cartTotals.items} ta</p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                {featuredFoods.map((food, index) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card className="overflow-hidden border-0 bg-white shadow-xl">
                      <div className="grid grid-cols-[120px_1fr]">
                        <img
                          src={food.image}
                          alt={food.nameUz || food.name}
                          className="h-full min-h-[126px] w-full object-cover"
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                        <div className="space-y-2 p-4">
                          <Badge variant="outline" className="border-orange-200 text-orange-700">
                            {food.categoryUz || 'Menu'}
                          </Badge>
                          <p className="text-lg font-bold text-slate-900">{food.nameUz || food.name}</p>
                          <p className="line-clamp-2 text-sm text-slate-500">
                            {food.descriptionUz || food.description}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="font-bold text-orange-600">
                              {food.price.toLocaleString()} so'm
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(food)}
                              className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              Savatga
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {filteredFoods.length === 0 ? (
              <motion.div
                className="py-32 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Search className="h-16 w-16 text-orange-400" />
                </motion.div>
                <p className="text-xl font-bold text-slate-500">Hech narsa topilmadi</p>
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Boshqa kategoriya yoki qidiruv so'zi bilan urinib ko'ring
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredFoods.map((food, index) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                  >
                    <FoodCard
                      food={food}
                      quantity={getQuantityInCart(food.id)}
                      isRecentlyAdded={recentlyAddedFoodId === food.id}
                      onAdd={handleAddToCart}
                      onRemove={handleRemoveFromCart}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {cartActivity && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-24 left-4 right-4 z-40 md:left-auto md:right-6 md:w-[360px]"
          >
            <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
              {cartActivity.image ? (
                  <img
                    src={cartActivity.image}
                    alt={cartActivity.label}
                    className="h-14 w-14 rounded-2xl object-cover"
                    loading="lazy"
                    decoding="async"
                  />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Savat harakati
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">{cartActivity.label}</p>
                <p className="truncate text-xs text-slate-500">{cartActivity.subtitle}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-50">
        <Cart
          items={cart}
          onAdd={handleAddToCart}
          onRemove={handleRemoveFromCart}
          onClear={handleClearItem}
          onCheckout={handleCheckout}
          highlightToken={highlightToken}
          lastAddedLabel={lastAddedLabel}
        />
      </div>
    </div>
  );
}
