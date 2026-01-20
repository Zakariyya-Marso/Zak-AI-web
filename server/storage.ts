// Re-export storage from integrations
export { authStorage } from "./replit_integrations/auth/storage";
export { chatStorage } from "./replit_integrations/chat/storage";

// Define a combined interface if needed, or just use them directly.
// For the template's sake, we can export a dummy storage object or just rely on the imports above.
export const storage = {}; 
