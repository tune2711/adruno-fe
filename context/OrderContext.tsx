import React, { createContext, useState, ReactNode } from 'react';
import { CartItem } from '../types';

// Define the structure of an Order
interface Order {
  id: string;
  items: CartItem[];
  date: Date;
  paymentMethod: string; // Added to store payment method
}

// Define the shape of the context
interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], paymentMethod: string) => void; // Updated function signature
}

// Create the context
export const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Create the provider component
export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Updated addOrder function to accept paymentMethod
  const addOrder = (items: CartItem[], paymentMethod: string) => {
    if (items.length === 0) return;
    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.random()}`,
      items: items,
      date: new Date(),
      paymentMethod: paymentMethod, // Save the payment method
    };
    setOrders(prevOrders => [...prevOrders, newOrder]);
    // Here you would typically also send the order to a backend server
    console.log('New Order Created:', newOrder);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
