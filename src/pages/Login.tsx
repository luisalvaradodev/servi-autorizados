import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Registro exitoso",
        description: "Se ha creado tu cuenta. Por favor verifica tu correo electrónico.",
      });

      // Automatically sign in after registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 dark:bg-slate-950">
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ModeToggle />
      </div>
      
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md px-8">
          <div className="flex flex-col items-center space-y-2 text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Wrench className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ServiAutorizados</h1>
            <p className="text-muted-foreground">
              Sistema de gestión para servicios de electrodomésticos
            </p>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 pb-2">
              <Tabs 
                value={authMode} 
                onValueChange={(v) => setAuthMode(v as "login" | "register")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="data-[state=active]:bg-background">
                    Iniciar sesión
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-background">
                    Registrarse
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <CardDescription className="pt-2">
                {authMode === "login" 
                  ? "Ingresa tus credenciales para acceder al sistema" 
                  : "Crea una cuenta nueva para acceder al sistema"}
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={authMode === "login" ? handleLogin : handleRegister}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    {authMode === "login" && (
                      <a
                        href="#"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {authMode === "login" ? "Iniciando sesión..." : "Registrando..."}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {authMode === "login" ? (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          <span>Iniciar sesión</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Registrarse</span>
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            © 2025 ServiAutorizados. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}