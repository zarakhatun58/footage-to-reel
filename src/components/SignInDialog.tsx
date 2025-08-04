import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

import { app } from "@/lib/firebase";
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

    const navigate = useNavigate();
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
            const res = await fetch(`${BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (res.ok) {
                // Save JWT or session token
                localStorage.setItem('authToken', data.token);
                console.log('Logged in:', data.user);

                // Redirect to home or dashboard
                navigate('/');
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
                    <DialogFooter>
                       <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SignInDialog;