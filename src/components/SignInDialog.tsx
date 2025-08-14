import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { BASE_URL } from "@/services/apis";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { googleLogout } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

type SignInDialogProps = {
    open: boolean;
    onClose: () => void;
};

const SignInDialog = ({ onClose, open }: SignInDialogProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signUpName, setSignUpName] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const { user, setUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useParams();
    const [loading, setLoading] = useState(false);
 
    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setResetToken(token);
            setResetPasswordOpen(true);
        }
    }, [searchParams]);


    const handleSignUp = async (e: any) => {
        e.preventDefault();
        try {
            const registerRes = await axios.post(
                `${BASE_URL}/api/auth/register`,
                {
                    username: signUpName,  // ✅ match backend
                    email: signUpEmail,
                    password: signUpPassword,
                },
                { withCredentials: true }
            );

            console.log("✅ Register response:", registerRes.data);

            const { user, token } = registerRes.data;

            if (!user?.id && !user?._id) {
                throw new Error("Signup succeeded but user ID is missing.");
            }

            // ✅ Store token and update UI instantly
            localStorage.setItem("authToken", token);
            setUser(user);

            alert("✅ Sign up successful!");
            onClose();
            navigate("/");
        } catch (err: any) {
            console.error("Signup failed:", err);
            alert(err.response?.data?.message || "Signup failed");
        }
    };


    // 🔹 Email/password login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // stop form from closing / page reloading

        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/login`, {
                email,
                password,
            });

            console.log("📦 Full login response:", res.data);

            const { token, user } = res.data;

            if (!token || !user) {
                console.error("❌ Login succeeded but user/token is missing:", res.data);
                alert("Login failed: Missing user info from server");
                return;
            }

            localStorage.setItem("authToken", token);
            setUser(user);

            alert(`✅ Login successful! Welcome ${user.username || user.email}`);
            console.log("👤 Logged in user set in AuthContext:", user);

            onClose();
            navigate("/");
        } catch (err: any) {
            console.error("❌ Login failed:", err);
            setError(err.response?.data?.error || "Login failed");
            alert(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };


    // 🔹 Google login
 const handleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("Google credentialResponse:", credentialResponse);

    if (!credentialResponse?.credential) {
      alert("Google login failed: No credential returned");
      return;
    }

    try {
      const res = await api.post('/api/auth/googleLogin', {
        token: credentialResponse.credential,
      });

      const { token, user } = res.data;

      if (!token || !user) {
        alert("Google login failed: Missing user info");
        return;
      }

      const normalizedUser = {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        token,
      };

      localStorage.setItem("authToken", token);
      setUser(normalizedUser);

      alert(`✅ Google login successful! Welcome ${user.username || user.email}`);
      onClose();
      navigate("/");
    } catch (err: any) {
      console.error("Google login failed:", err);
      alert(err.response?.data?.error || "Google login failed");
    }
  };


    const handleError = () => {
        console.error("Google Sign-In failed");
        alert("Google Sign-In failed");
    };

    const handleLogout = () => {
        try {
            // Log out from Google if user is logged in via Google
            googleLogout();

            // Clear local auth token
            localStorage.removeItem('authToken');

            // Reset user in context if needed
            setUser(null);

            // Redirect to homepage
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
            alert("Logout failed, please try again.");
        }
    };


    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!forgotEmail.trim()) {
            alert("Please enter your email");
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
                email: forgotEmail,
            });

            console.log("📩 Forgot password response:", res.data);
            alert("📨 Reset email sent if the account exists!");
            setForgotPasswordOpen(false);
            setForgotEmail("");
        } catch (err: any) {
            console.error("❌ Forgot password error:", err);
            alert(err.response?.data?.error || "Failed to send reset email.");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword.trim()) return alert("Please enter a new password");

        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
                token: resetToken, // use the state variable
                newPassword,
            });
            alert("✅ Password reset successfully!");
            navigate("/");
        } catch (err: any) {
            console.error("❌ Reset password error:", err);
            alert(err.response?.data?.error || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        Sign in
                    </Button>
                </DialogTrigger>
                <DialogContent aria-describedby="login-description" className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            Welcome to DentalAI Pro
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Sign In</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="signin-email">Email</Label>
                                            <Input
                                                id="signin-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signin-password">Password</Label>
                                            <Input
                                                id="signin-password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                className="text-sm text-blue-600 hover:underline"
                                                onClick={() => setForgotPasswordOpen(true)}
                                            >
                                                Forgot password?
                                            </button>
                                            <button
                                                type="button"
                                                className="text-sm text-gray-500 hover:underline"
                                                onClick={() => {
                                                    setEmail("");
                                                    setPassword("");
                                                }}
                                            >
                                                Reset
                                            </button>
                                        </div>
                                        <Button type="submit" className="w-full">
                                            {loading ? "Signing in..." : "Sign In"}
                                        </Button>
                                    </form>
                                    <GoogleLogin onSuccess={handleSuccess} onError={handleError}  />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="signup">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Sign Up</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSignUp} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-name">Full Name</Label>
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                value={signUpName}
                                                onChange={(e) => setSignUpName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email">Email</Label>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                value={signUpEmail}
                                                onChange={(e) => setSignUpEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-password">Password</Label>
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                value={signUpPassword}
                                                onChange={(e) => setSignUpPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">
                                            Sign Up
                                        </Button>
                                    </form>
                               <GoogleLogin onSuccess={handleSuccess} onError={handleError}  />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </DialogContent>
            </Dialog>
            {/* Forgot Password Dialog */}
            <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Reset Your Password</DialogTitle>
                        <DialogDescription>
                            Enter your email to receive a password reset link.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4 bg-background">
                        <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <Input
                                id="forgot-email"
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full">
                                Send Reset Link
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Set New Password</DialogTitle>
                        <DialogDescription>
                            Enter your new password below to reset your account password.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-4 bg-background">
                        <div className="space-y-2">
                            <Label htmlFor="reset-password">New Password</Label>
                            <Input
                                id="reset-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full">
                                Reset Password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default SignInDialog;