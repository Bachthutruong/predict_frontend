// Utility functions for guest cart management

export const getGuestId = (): string => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    // Generate a unique guest ID
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

export const clearGuestId = () => {
  localStorage.removeItem('guestId');
};

