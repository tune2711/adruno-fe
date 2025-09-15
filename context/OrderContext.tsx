
import React, { createContext, useState, ReactNode } from 'react';
import { CartItem } from '../types';

interface Order {
  id: string;
  items: CartItem[];
  date: Date;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[]) => void;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (items: CartItem[]) => {
    if (items.length === 0) return;
    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.random()}`,
      items: items,
      date: new Date(),
    };
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
