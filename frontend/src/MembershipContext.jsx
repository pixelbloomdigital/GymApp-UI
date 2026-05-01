import { createContext, useContext, useState } from "react";

const MembershipContext = createContext();

export const useMemberships = () => {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMemberships must be used within MembershipProvider");
  }
  return context;
};

export const MembershipProvider = ({ children }) => {
  const [memberships, setMemberships] = useState([]);

  const addMembership = (memberName, planName, amount, durationDays) => {
    const newMembership = {
      id: memberships.length + 1,
      member: memberName,
      plan: planName,
      amount: amount,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Active"
    };
    setMemberships(prev => [newMembership, ...prev]);
    return newMembership;
  };

  const getMembershipStats = () => {
    const stats = {
      "1 Month Basic": 0,
      "3 Months Standard": 0,
      "6 Months Premium": 0,
      "12 Months Elite": 0
    };
    memberships.forEach(m => {
      if (stats[m.plan] !== undefined) {
        stats[m.plan]++;
      }
    });
    return stats;
  };

  return (
    <MembershipContext.Provider value={{ memberships, addMembership, getMembershipStats }}>
      {children}
    </MembershipContext.Provider>
  );
};
