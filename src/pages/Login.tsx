
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="flex min-h-screen items-center justify-center bg-notion-lightgray p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">ServiceScribe</h1>
          <p className="text-notion-gray mt-2">
            Sistema de gestión para servicios de electrodomésticos
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
            </Tabs>
            <CardDescription className="mt-2">
              {authMode === "login" 
                ? "Ingresa tus credenciales para acceder al sistema" 
                : "Crea una cuenta nueva para acceder al sistema"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={authMode === "login" ? handleLogin : handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  {authMode === "login" && (
                    <a
                      href="#"
                      className="text-sm text-notion-blue hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full notion-button"
                disabled={isLoading}
              >
                {isLoading 
                  ? (authMode === "login" ? "Iniciando sesión..." : "Registrando...") 
                  : (authMode === "login" ? "Iniciar sesión" : "Registrarse")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
