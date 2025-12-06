import { Link } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";
import BrandLogo from "@/components/BrandLogo";

const Login = () => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Login Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo/Brand */}
        <div className="flex justify-center md:justify-start">
          <Link to="/" className="flex items-center font-medium">
            <BrandLogo />
          </Link>
        </div>

        {/* Login Form Container */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right side - Background Video */}
      <div className="bg-muted relative hidden lg:block overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/login-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative h-full flex items-center justify-center p-10">
          <div className="max-w-md text-center space-y-6">
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
