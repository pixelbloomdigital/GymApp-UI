import { createContext, useContext, useState } from "react";

const PaymentContext = createContext();

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayments must be used within PaymentProvider");
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([
    { id: 1, member: "Rahul Kumar", amount: 5000, date: "2024-01-15", time: "11:30 AM", status: "Completed", method: "Card" },
    { id: 2, member: "Sneha Patel", amount: 3000, date: "2024-01-14", time: "12:45 PM", status: "Completed", method: "UPI" },
    { id: 3, member: "Amit Shah", amount: 7500, date: "2024-01-13", time: "01:15 PM", status: "Completed", method: "Net Banking" },
    { id: 4, member: "Pooja Singh", amount: 5000, date: "2024-01-12", time: "05:30 PM", status: "Completed", method: "Card" },
    { id: 5, member: "Rohit Sharma", amount: 4000, date: "2024-01-11", time: "09:01 PM", status: "Completed", method: "UPI" },
    { id: 6, member: "Priya Verma", amount: 2500, date: "2024-01-10", time: "03:20 PM", status: "Completed", method: "Card" },
    { id: 7, member: "Vikram Singh", amount: 9000, date: "2024-01-09", time: "10:15 AM", status: "Completed", method: "Net Banking" },
    { id: 8, member: "Anjali Gupta", amount: 1000, date: "2024-01-08", time: "02:30 PM", status: "Completed", method: "UPI" },
    { id: 9, member: "Karan Mehta", amount: 5000, date: "2024-01-16", time: "04:15 PM", status: "Pending", method: "Net Banking" },
    { id: 10, member: "Neha Sharma", amount: 2500, date: "2024-01-16", time: "11:00 AM", status: "Pending", method: "UPI" },
    { id: 11, member: "Ravi Kumar", amount: 3000, date: "2024-01-15", time: "08:45 PM", status: "Failed", method: "Card" },
    { id: 12, member: "Sonia Patel", amount: 7500, date: "2024-01-14", time: "06:30 PM", status: "Failed", method: "UPI" }
  ]);

  const addPayment = (paymentData, userName = "Gym Member") => {
    const now = new Date();
    const newPayment = {
      id: payments.length + 1,
      member: userName,
      amount: parseFloat(paymentData.amount),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: "Completed",
      method: paymentData.method === "card" ? "Card" : 
              paymentData.method === "upi" ? "UPI" : "Net Banking"
    };
    setPayments([newPayment, ...payments]);
    return newPayment;
  };

  const deletePayment = (id) => {
    setPayments(payments.filter(payment => payment.id !== id));
  };

  return (
    <PaymentContext.Provider value={{ payments, addPayment, deletePayment }}>
      {children}
    </PaymentContext.Provider>
  );
};
