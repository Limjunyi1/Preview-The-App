import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Users, ArrowRight, CheckCircle } from "lucide-react";
import BrandLogo from "@/components/brand-logo";

const Index = () => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/questionnaire">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Compatibility Simulation
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
              Know Before You <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Say Hello
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Skip the talking stage fatigue. Our AI simulates your first date to reveal 
              compatibility wins and friction points before you message.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/questionnaire">
                <Button variant="hero" size="xl" className="group">
                  Start Your Preview
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full" />
            <div className="relative bg-card rounded-2xl shadow-elevated border border-border p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Alex & Jordan</h3>
                    <p className="text-sm text-muted-foreground">Simulation Complete</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  78% Compatible
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                  <h4 className="text-sm font-medium text-success mb-2">High Point</h4>
                  <p className="text-sm text-muted-foreground">
                    "Both share a passion for spontaneous travel and work-life balance."
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-warning/5 border border-warning/20">
                  <h4 className="text-sm font-medium text-warning mb-2">Friction Point</h4>
                  <p className="text-sm text-muted-foreground">
                    "Different views on financial planning and saving habits."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              How Preview Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to meaningful connections
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Share Your Values",
                description: "Complete our deep-dive questionnaire covering finances, lifestyle, and core values.",
                step: "01"
              },
              {
                icon: Sparkles,
                title: "AI Simulates Your Date",
                description: "Our AI agents role-play a first date based on your authentic profiles.",
                step: "02"
              },
              {
                icon: Users,
                title: "Review & Connect",
                description: "Read your Simulation Report to make informed decisions before messaging.",
                step: "03"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="relative p-8 rounded-2xl bg-background border border-border hover:shadow-elevated transition-all duration-300 group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-6 right-6 text-6xl font-serif font-bold text-muted/30 group-hover:text-primary/20 transition-colors">
                  {feature.step}
                </div>
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-soft">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-6">
            Ready to Preview Your Connections?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join thousands who are finding meaningful relationships through informed dating.
          </p>
          <Link to="/questionnaire">
            <Button variant="hero" size="xl" className="group">
              Begin Your Journey
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border bg-card">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <BrandLogo />
          <p className="text-sm text-muted-foreground">
            © 2024 Preview. Meaningful connections start here.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
