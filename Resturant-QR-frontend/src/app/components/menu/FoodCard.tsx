import { Food } from '../../../types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Check, Minus, Plus, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface FoodCardProps {
  food: Food;
  quantity?: number;
  isRecentlyAdded?: boolean;
  onAdd: (food: Food) => void;
  onRemove: (food: Food) => void;
}

export function FoodCard({
  food,
  quantity = 0,
  isRecentlyAdded = false,
  onAdd,
  onRemove,
}: FoodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isRecentlyAdded ? [1, 1.02, 1] : 1,
      }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -12, scale: 1.02, transition: { duration: 0.3 } }}
    >
      <Card className="group relative overflow-hidden border-0 bg-white transition-all duration-300 hover:shadow-2xl">
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
          }}
        />

        {isRecentlyAdded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 right-4 top-4 z-20 flex items-center justify-center gap-2 rounded-full bg-slate-950/85 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur"
          >
            <Check className="h-4 w-4 text-emerald-300" />
            Savatga tushdi
          </motion.div>
        )}

        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-50 to-slate-100">
          <motion.img
            src={food.image}
            alt={food.nameUz || food.name}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          <motion.div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {!food.available && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.span
                className="rounded-full bg-red-500 px-6 py-3 font-semibold text-white shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Mavjud emas
              </motion.span>
            </motion.div>
          )}

          {food.available && quantity === 0 && (
            <div className="absolute right-3 top-3 z-10">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6 text-yellow-400 drop-shadow-2xl" />
              </motion.div>
            </div>
          )}

          {quantity > 0 && (
            <motion.div
              className="absolute left-3 top-3 z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <motion.div
                className="flex items-center gap-1 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-3 py-1 font-bold text-white shadow-xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span>{quantity}</span>
                <Check className="h-3.5 w-3.5" />
              </motion.div>
            </motion.div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">{food.nameUz || food.name}</h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
              {food.descriptionUz || food.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <motion.span
                className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-2xl font-bold text-transparent"
                animate={quantity > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {food.price.toLocaleString()}
              </motion.span>
              <span className="text-xs text-slate-500">so'm</span>
            </div>

            {quantity === 0 ? (
              <Button
                onClick={() => onAdd(food)}
                disabled={!food.available}
                className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Qo'shish
              </Button>
            ) : (
              <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-50 to-orange-100 px-2 py-1">
                <Button
                  onClick={() => onRemove(food)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 hover:bg-orange-200"
                >
                  <Minus className="h-4 w-4 text-orange-600" />
                </Button>
                <span className="min-w-[2rem] text-center font-bold text-orange-600">
                  {quantity}
                </span>
                <Button
                  onClick={() => onAdd(food)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 hover:bg-orange-200"
                >
                  <Plus className="h-4 w-4 text-orange-600" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
