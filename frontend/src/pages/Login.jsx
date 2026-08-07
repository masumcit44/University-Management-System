import LoginForm from "../components/LoginForm";

import Illustration from "../assets/images/undraw_knowledge_0ty5.svg";

function Login() {
  return (
    <div className="min-h-screen bg-slate-100 grid lg:grid-cols-2">

      {/* Left */}

      <div className="hidden lg:flex items-center justify-center bg-blue-600">

        <img
          src={Illustration}
          alt="Illustration"
          className="w-3/4"
        />

      </div>

      {/* Right */}

      <div className="flex items-center justify-center p-8">

        <LoginForm />

      </div>

    </div>
  );
}

export default Login;