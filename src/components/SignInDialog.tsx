import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { BASE_URL } from "@/services/apis";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { googleLogout } from "@react-oauth/google";

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
    const [user, setUser] = useState(null);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setResetToken(token);
            setResetPasswordOpen(true);
        }
    }, [searchParams]);



    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            if (!email || !password) {
                alert("Email and password are required.");
                return;
            }
            const res = await axios.post(
                `${BASE_URL}/api/auth/login`,
                { email, password },
                { withCredentials: true }
            );
            const { id, name, email: userEmail } = res.data;
            const user = { id, name, email: userEmail };
            alert("Login successful!");
            navigate("/");
        } catch (err: any) {
            console.error("Login error:", err);
            alert(err?.response?.data?.message || err?.message || "Login failed. Please try again.");
        } finally {
            onClose();
        }
    };
    const handleSignUp = async (e: any) => {
        e.preventDefault();
        try {
            const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, {
                name: signUpName,
                email: signUpEmail,
                password: signUpPassword,
            }, { withCredentials: true });

            console.log("✅ Register response:", registerRes.data);

            const { user, token } = registerRes.data;

            if (!user?.id && !user?._id) {
                throw new Error("Signup succeeded but user ID is missing.");
            }
            alert("✅ Sign up successful!");
            navigate("/");
        } catch (err: any) {
            console.error("Signup failed:", err);
        } finally {
            onClose();
        }
    };

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;
    if (!token) {
      console.error('No credential received');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/googleLogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('authToken', data.token);

        // Set user in context here
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          profilePic: data.user.profilePic,
        });

        navigate('/');
        onClose();
      } else {
        console.error('Login failed:', data.error);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

    const handleError = () => {
        console.error('Google login failed');
    };

    const handleLogout = async () => {
        localStorage.removeItem('authToken');
        navigate("/");
        googleLogout();
    };
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail) return alert("Please enter your email");

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
                email: forgotEmail,
            });
            alert("📨 Reset email sent if account exists!");
            setForgotPasswordOpen(false);
        } catch (err: any) {
            console.error("Forgot password error:", err);
            alert("Failed to send reset email.");
        }
    };
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword) return alert("Please enter a new password");

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
                token: resetToken,
                newPassword,
            });

            alert("✅ Password reset successfully! Please login with your new password.");
            setResetPasswordOpen(false);
            setNewPassword("");
            setResetToken("");

            // Optionally redirect to home or login page
            navigate("/");
        } catch (err: any) {
            console.error("Reset password error:", err);
            alert(err?.response?.data?.error || "Failed to reset password.");
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
                                            Sign In
                                        </Button>
                                    </form>

                                    <div
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 
                                        cursor-pointer hover:shadow-sm flex items-center justify-center gap-2" >
                                        <GoogleLogin onSuccess={handleSuccess} onError={handleError} >
                                        </GoogleLogin>
                                    </div>
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
                                    <div
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:shadow-sm flex items-center justify-center gap-2 mt-2"

                                    >
                                        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
                                    </div>
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
                    <form onSubmit={handleForgotPassword} className="space-y-4">
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
                    <form onSubmit={handleResetPassword} className="space-y-4">
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