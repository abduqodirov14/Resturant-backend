import { useEffect, useState } from 'react';
import { CartItem } from '../../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { cn } from '../ui/utils';
import { ConfettiEffect } from './ConfettiEffect';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, ShoppingCart, Sparkles, Trash2 } from 'lucide-react';
import { useIsMobile } from '../ui/use-mobile';

interface CartProps {
  items: CartItem[];
  onAdd: (food: CartItem['food']) => void;
  onRemove: (food: CartItem['food']) => void;
  onClear: (foodId: number) => void;
  onCheckout: () => Promise<boolean> | boolean;
  highlightToken?: number;
  lastAddedLabel?: string;
}

export function Cart({
  items,
  onAdd,
  onRemove,
  onClear,
  onCheckout,
  highlightToken,
  lastAddedLabel,
}: CartProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.food.price * item.quantity, 0);

  useEffect(() => {
    if (!highlightToken) return;

    setCartPulse(true);
    const timer = window.setTimeout(() => setCartPulse(false), 900);
    return () => window.clearTimeout(timer);
  }, [highlightToken]);

  const handleCheckout = async () => {
    try {
      setIsCheckoutLoading(true);
      const success = await onCheckout();
      if (success === false) return;

      setShowConfetti(true);
      setOpen(false);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <>
      <ConfettiEffect trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {isMobile && totalItems > 0 ? (
            <motion.button
              type="button"
              aria-label="Savatchani ochish"
              className={cn(
                'fixed inset-x-4 bottom-4 z-50 rounded-3xl border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl',
                cartPulse && 'ring-2 ring-orange-300'
              )}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 px-4 py-3 text-left">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                  <ShoppingCart className="h-6 w-6" />
                  <Badge className="absolute -right-2 -top-2 h-6 min-w-6 rounded-full border-2 border-white bg-red-500 px-1 text-xs text-white">
                    {totalItems}
                  </Badge>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">Savat tayyor</p>
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {lastAddedLabel ? `${lastAddedLabel} savatda` : `${totalItems} ta mahsulot`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">Jami</p>
                  <p className="text-base font-bold text-orange-600">
                    {totalPrice.toLocaleString()} so'm
                  </p>
                </div>
              </div>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              aria-label="Savatchani ochish"
              className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
            >
              {totalItems > 0 && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-orange-400"
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.45, 0, 0.45],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <motion.div
                animate={{
                  scale: totalItems > 0 || cartPulse ? [1, 1.18, 1] : 1,
                  rotate: totalItems > 0 || cartPulse ? [0, -10, 10, 0] : 0,
                }}
                transition={{
                  duration: 0.5,
                  repeat: totalItems > 0 ? Infinity : 0,
                  repeatDelay: 2,
                }}
              >
                <ShoppingCart className="h-7 w-7" />
              </motion.div>

              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Badge className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-red-500 to-red-600 p-0 shadow-lg">
                      {totalItems}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </SheetTrigger>

        <SheetContent
          side={isMobile ? 'bottom' : 'right'}
          className={cn(
            'flex flex-col overflow-hidden bg-gradient-to-br from-white to-orange-50/30 p-0',
            isMobile
              ? 'h-[88dvh] max-h-[88dvh] rounded-t-[2rem] border-t'
              : 'h-[100dvh] max-h-[100dvh] w-full border-l sm:max-w-md'
          )}
        >
          <SheetHeader className="shrink-0 border-b bg-white/80 px-6 pb-4 pt-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-2">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <SheetTitle className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-2xl text-transparent">
                Savatcha
              </SheetTitle>
              {totalItems > 0 && (
                <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-orange-600">
                  {totalItems} ta
                </Badge>
              )}
            </div>
          </SheetHeader>

          {items.length === 0 ? (
            <motion.div
              className="flex min-h-0 flex-1 flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100">
                <ShoppingCart className="h-14 w-14 text-orange-400" />
              </div>
              <p className="mb-2 text-xl font-semibold text-slate-400">Savatcha bo'sh</p>
              <p className="text-sm text-slate-400">Buyurtma berishni boshlang</p>
            </motion.div>
          ) : (
            <>
              <ScrollArea className="min-h-0 flex-1 px-6 py-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.food.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.28, delay: index * 0.04 }}
                        whileHover={{ scale: 1.01, x: 4 }}
                      >
                        <div className="group relative flex gap-3 overflow-hidden rounded-xl border border-orange-100 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-xl">
                          <motion.div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-30" />

                          <div className="relative">
                            <motion.img
                              src={item.food.image}
                              alt={item.food.nameUz || item.food.name}
                              className="h-20 w-20 rounded-lg object-cover"
                              loading="lazy"
                              decoding="async"
                              whileHover={{ scale: 1.06, rotate: 3 }}
                              transition={{ duration: 0.25 }}
                            />
                            <motion.div
                              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-bold text-white shadow-lg"
                              animate={{ scale: [1, 1.16, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {item.quantity}
                            </motion.div>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="text-sm font-bold text-slate-900">
                                {item.food.nameUz || item.food.name}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onClear(item.food.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-50 to-orange-100 px-1 py-1">
                                <Button
                                  onClick={() => onRemove(item.food)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 rounded-full p-0 hover:bg-orange-200"
                                >
                                  <Minus className="h-3 w-3 text-orange-600" />
                                </Button>
                                <span className="min-w-[2rem] text-center font-bold text-orange-600">
                                  {item.quantity}
                                </span>
                                <Button
                                  onClick={() => onAdd(item.food)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 rounded-full p-0 hover:bg-orange-200"
                                >
                                  <Plus className="h-3 w-3 text-orange-600" />
                                </Button>
                              </div>

                              <span className="font-bold text-orange-600">
                                {(item.food.price * item.quantity).toLocaleString()} so'm
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="sticky bottom-0 z-10 mt-auto shrink-0 space-y-4 border-t bg-white/95 px-6 py-5 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-slate-700">Jami:</span>
                  <motion.span
                    className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-2xl font-bold text-transparent"
                    key={totalPrice}
                    initial={{ scale: 1.16 }}
                    animate={{ scale: 1 }}
                  >
                    {totalPrice.toLocaleString()} so'm
                  </motion.span>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckoutLoading}
                    className="group relative h-14 w-full overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 text-lg font-semibold text-white shadow-xl hover:from-orange-600 hover:to-orange-700"
                    size="lg"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isCheckoutLoading ? 'Yuborilmoqda...' : 'Buyurtma berish'}
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
