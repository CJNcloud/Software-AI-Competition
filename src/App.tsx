import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { RouterProvider } from "react-router-dom"
import { router } from "./routes"

function App() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <Navbar />
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;

