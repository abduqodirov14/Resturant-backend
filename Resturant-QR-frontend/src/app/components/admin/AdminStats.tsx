import { motion } from 'motion/react';
import { Card } from '../ui/card';

interface AdminStatsProps {
  stats: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    bg: string;
  }[];
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-0">
            <div className="flex items-center gap-4">
              <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-xl shadow-lg`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">{stat.label}</p>
                <motion.p 
                  className="text-2xl font-bold"
                  key={stat.value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {stat.value}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
