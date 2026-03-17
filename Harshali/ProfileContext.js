import { createContext, useContext, useState } from "react";

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    name: "Gym Member",
    email: "member@powerzone.com",
    phone: "9876543210",
    membership: "Active",
    plan: "No Active Plan",
    planExpiry: null,
    profileImage: "/assets/th.webp"
  });

  const updateProfile = (updatedData) => {
    setProfile(prev => ({ ...prev, ...updatedData }));
  };

  const activateMembership = (planName, durationDays) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    setProfile(prev => ({ 
      ...prev, 
      membership: "Active", 
      plan: planName,
      planExpiry: expiryDate.toISOString().split('T')[0]
    }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, activateMembership }}>
      {children}
    </ProfileContext.Provider>
  );
};
