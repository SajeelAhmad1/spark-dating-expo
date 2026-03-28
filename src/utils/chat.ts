export const getTimeString = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const generateId = () =>
  Date.now().toString() + Math.random().toString(36).slice(2);


