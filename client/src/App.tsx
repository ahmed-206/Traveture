import "./index.css";
import AppRouter from "./routes/AppRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster 
      position="bottom-center" 
      toastOptions={{ 
        duration: 3000, 
        style: { 
          background: "#1f2937", 
          color: "#ffffff", 
          border: "none", 
          borderRadius: "10px", 
          padding: "12px 20px", 
          fontSize: "16px", 
          fontWeight: "600", 
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)", 
          maxWidth: "400px",
          }, 
          icon: null, 
          success: { icon: null, style: { background: "#163042", color: "#ffffff", }, }, 
          error: { icon: null, style: { background: "#1f2937", color: "#FF4B4B", }, }, }}/>
    <AppRouter />
  </QueryClientProvider>
  )
  
}

export default App;
