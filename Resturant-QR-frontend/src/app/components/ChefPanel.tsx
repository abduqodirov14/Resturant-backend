import { useEffect, useMemo, useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, CheckCircle, ChefHat, Clock, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AnimatePresence, motion } from 'motion/react';
import { api, DEFAULT_FOOD_IMAGE } from '../lib/api';
import { resolveImageUrl } from '../lib/image';
import React from 'react';

type ChefOrderStatus = Extract<OrderStatus, 'pending' | 'preparing' | 'ready'>;

const statusConfig = {
  pending: { label: 'Yangi', icon: Clock, color: 'bg-gradient-to-br from-yellow-400 to-yellow-500' },
  preparing: { label: 'Tayyorlanmoqda', icon: ChefHat, color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
  ready: { label: 'Tayyor', icon: CheckCircle, color: 'bg-gradient-to-br from-green-400 to-green-500' },
} satisfies Record<ChefOrderStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }>;

const statusFlow: ChefOrderStatus[] = ['pending', 'preparing', 'ready'];

export function ChefPanel({ onBack }: { onBack?: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<ChefOrderStatus>('pending');
  const [counts, setCounts] = useState<Record<ChefOrderStatus, number>>({
    pending: 0,
    preparing: 0,
    ready: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const mapOrders = (rawOrders: any[]): Order[] =>
    rawOrders.map((order: any) => ({
      ...order,
      status: String(order.status || '').toLowerCase() as OrderStatus,
      totalPrice: Number(order.total || 0),
      createdAt: new Date(order.createdAt),
      updatedAt: new Date(order.updatedAt),
      items: (order.items || []).map((item: any) => ({
        ...item,
        price: Number(item.unitPrice || item.price || 0),
        unitPrice: Number(item.unitPrice || item.price || 0),
        lineTotal: Number(item.lineTotal || 0),
        food: {
          ...item.food,
          price: Number(item.food?.price || 0),
          nameUz: item.food?.name,
          descriptionUz: item.food?.description || '',
          image: resolveImageUrl(item.food?.imageUrl, DEFAULT_FOOD_IMAGE),
          categoryUz: item.food?.category?.name || item.food?.categoryName || '',
          available: item.food?.isAvailable ?? true,
        },
      })),
    }));

  const loadOrders = async (status: ChefOrderStatus, silent = false) => {
    try {
      if (!silent) setIsLoading(true);

      const [summaryRes, ordersRes] = await Promise.all([
        api.orderSummary(),
        api.orders({ status, limit: 120, details: true }),
      ]);

      setCounts({
        pending: Number(summaryRes.counts?.pending || 0),
        preparing: Number(summaryRes.counts?.preparing || 0),
        ready: Number(summaryRes.counts?.ready || 0),
      });
      setOrders(mapOrders(ordersRes.orders || []));
    } catch (error: any) {
      toast.error(error.message || "Buyurtmalarni yuklab bo'lmadi");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadOrders(activeTab, true);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeTab]);

  const handleStatusChange = async (orderId: number, newStatus: ChefOrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success(`Buyurtma #${orderId} holati yangilandi`);
      loadOrders(activeTab, true);
    } catch (error: any) {
      toast.error(error.message || "Holatni yangilab bo'lmadi");
    }
  };

  const groupedOrders = useMemo(() => {
    const groups = new Map<number, { tableNumber: number; orders: Order[] }>();

    orders.forEach((order) => {
      const tableNumber = Number(order.table?.number || order.tableId);
      const existing = groups.get(tableNumber);

      if (existing) {
        existing.orders.push(order);
      } else {
        groups.set(tableNumber, { tableNumber, orders: [order] });
      }
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        orders: group.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      }))
      .sort((a, b) => a.tableNumber - b.tableNumber);
  }, [orders]);

  const getNextStatus = (currentStatus: ChefOrderStatus): ChefOrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const formatTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 1) return 'Hozirgina';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    return `${Math.floor(minutes / 60)} soat oldin`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-orange-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="flex items-center justify-between gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-2xl relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-orange-400"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <ChefHat className="w-10 h-10 text-white relative z-10" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Oshpaz Paneli
                </h1>
                <p className="text-slate-600 mt-1">Buyurtmalar real backend orqali yangilanadi</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {counts.pending > 0 && (
                <motion.div
                  className="hidden md:flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-sm font-semibold text-red-600">
                    {counts.pending} yangi buyurtma
                  </span>
                </motion.div>
              )}

              {onBack && (
                <Button variant="outline" onClick={onBack} className="rounded-xl shadow-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Orqaga
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statusFlow.map((status, index) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-0">
                  <div className="flex items-center gap-3">
                    <div className={`${config.color} p-3 rounded-xl shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">{config.label}</p>
                      <motion.p
                        className="text-3xl font-bold"
                        key={counts[status]}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {counts[status]}
                      </motion.p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ChefOrderStatus)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white p-2 rounded-xl shadow-lg">
            {statusFlow.map((status) => (
              <TabsTrigger
                key={status}
                value={status}
                className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg transition-all duration-300"
              >
                {statusConfig[status].label}
                {counts[status] > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 px-1 bg-gradient-to-br from-red-500 to-red-600 border-0">
                    {counts[status]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {statusFlow.map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <AnimatePresence mode="wait">
                {isLoading && groupedOrders.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="p-16 text-center bg-gradient-to-br from-white to-orange-50/50 border-0 shadow-lg">
                      <p className="text-slate-500 text-xl font-semibold">Buyurtmalar yuklanmoqda...</p>
                    </Card>
                  </motion.div>
                ) : groupedOrders.length === 0 ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <Card className="p-16 text-center bg-gradient-to-br from-white to-orange-50/50 border-0 shadow-lg">
                      <div className="bg-gradient-to-br from-orange-100 to-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        {React.createElement(statusConfig[status].icon, { className: 'w-12 h-12 text-orange-400' })}
                      </div>
                      <p className="text-slate-400 text-xl font-semibold">Buyurtmalar yo'q</p>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {groupedOrders.map((group, index) => (
                      <motion.div
                        key={`${status}-table-${group.tableNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-0 bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                              Stol #{group.tableNumber}
                            </h3>
                            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600">
                              {group.orders.length} ta buyurtma
                            </Badge>
                          </div>

                          <div className="space-y-4">
                            {group.orders.map((order) => {
                              const nextStatus = getNextStatus(order.status as ChefOrderStatus);

                              return (
                                <div key={order.id} className="rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50/40 to-amber-50/40 p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-slate-800">Buyurtma #{order.id}</h4>
                                    <Badge variant="outline" className="text-xs border-orange-200">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatTime(order.createdAt)}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/80">
                                        <img
                                          src={resolveImageUrl(item.food.image || item.food.imageUrl, DEFAULT_FOOD_IMAGE)}
                                          alt={item.food.nameUz || item.food.name}
                                          className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                          loading="lazy"
                                          decoding="async"
                                        />
                                        <div className="flex-1">
                                          <p className="font-semibold text-sm">{item.food.nameUz || item.food.name}</p>
                                          <p className="text-slate-600 text-xs">
                                            {item.quantity}x {Number(item.price).toLocaleString()} so'm
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-orange-100">
                                    <span className="font-semibold text-slate-700">Jami:</span>
                                    <span className="text-lg font-bold text-orange-600">
                                      {order.totalPrice.toLocaleString()} so'm
                                    </span>
                                  </div>

                                  {nextStatus && (
                                    <Button
                                      onClick={() => handleStatusChange(order.id, nextStatus)}
                                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg font-semibold"
                                    >
                                      {nextStatus === 'preparing' && (
                                        <>
                                          <Flame className="w-5 h-5 mr-2" />
                                          Tayyorlashni boshlash
                                        </>
                                      )}
                                      {nextStatus === 'ready' && 'Tayyor deb belgilash'}
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
