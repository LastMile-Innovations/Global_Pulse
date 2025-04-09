"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, User, MessageSquare, Zap, Clock } from "lucide-react";

export default function ContactPage() {
  // Placeholder handler
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted (placeholder)");
    alert("Thank you for your message! (This is a placeholder)");
  };

  return (
    <div className="relative overflow-hidden">
      {/* Enhanced Hero Section */}
      <section className="relative py-24 md:py-32 lg:py-40 bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-40 w-48 h-48 bg-blue-500/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-teal-500/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
             {/* Introductory badge */}
             <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold border-transparent bg-primary/20 text-primary w-fit mb-8 animate-fade-in shadow-sm">
               <Zap className="mr-2 h-4 w-4" /> We're Here to Help
             </div>
             {/* Gradient Title */}
             <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl/none lg:text-8xl/none mb-6">
                <span className="bg-gradient-to-r from-primary via-blue-500 to-teal-400 text-transparent bg-clip-text">
                  Get in Touch
                </span>
             </h1>
             <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
               Have questions, feedback, or brilliant ideas? We're eager to hear from you. Reach out using the form below or through our direct channels.
             </p>
           </div>
         </div>
       </section>

       {/* Contact Form & Details Section - Two Column Layout */}
       <section className="py-12 md:py-16 lg:py-20">
         <div className="container px-4 md:px-6">
           <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-start">
             {/* Column 1: Contact Form Card */}
             <Card className="border-primary/20 shadow-lg overflow-hidden lg:sticky lg:top-24"> {/* Added sticky for form */}
               <CardHeader className="bg-muted/30 border-b border-primary/10">
                 <CardTitle className="text-2xl font-semibold flex items-center gap-3 text-primary">
                   <Mail className="h-6 w-6" />
                   Send Us a Message
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6 md:p-8">
                 <form onSubmit={handleSubmit} className="grid gap-6">
                   {/* Form Fields remain the same */}
                   <div className="grid gap-2">
                     <Label htmlFor="name" className="flex items-center gap-1.5 font-medium">
                       <User className="h-4 w-4 text-muted-foreground" /> Your Name
                     </Label>
                     <Input id="name" placeholder="e.g., Alex Johnson" required className="h-11 text-base"/>
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="email" className="flex items-center gap-1.5 font-medium">
                       <Mail className="h-4 w-4 text-muted-foreground" /> Your Email
                     </Label>
                     <Input id="email" type="email" placeholder="e.g., alex.j@example.com" required className="h-11 text-base"/>
                   </div>
                   <div className="grid gap-2">
                     <Label htmlFor="message" className="flex items-center gap-1.5 font-medium">
                       <MessageSquare className="h-4 w-4 text-muted-foreground" /> Your Message
                     </Label>
                     <Textarea
                       id="message"
                       placeholder="Let us know how we can help or what's on your mind..."
                       required
                       rows={6}
                       className="text-base"
                     />
                   </div>
                   <Button type="submit" size="lg" className="w-full gap-2 h-12 text-base group relative overflow-hidden">
                     <span className="relative z-10 flex items-center">
                       Send Message <Send className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                     </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                   </Button>
                 </form>
               </CardContent>
             </Card>

             {/* Column 2: Contact Details */}
             <div className="space-y-8 lg:pt-4">
                <h2 className="text-3xl font-bold tracking-tight">Direct Contact Information</h2>
                <p className="text-muted-foreground text-lg">
                  Prefer not to use the form? Here are other ways to reach our team. We typically respond within one business day.
                </p>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                       <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Email Us</h3>
                      <p className="text-muted-foreground">For support, inquiries, or feedback:</p>
                      <a href="mailto:support@globalpulse.app" className="font-medium text-primary hover:underline text-lg break-all">
                        support@globalpulse.app
                      </a>
                    </div>
                  </div>

                  {/* Placeholder: Phone (Optional) */}
                  {/*
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                       <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Call Us</h3>
                      <p className="text-muted-foreground">Reach us during business hours:</p>
                      <a href="tel:+15551234567" className="font-medium text-primary hover:underline text-lg">
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>
                   */}

                  {/* Placeholder: Office Address (Optional) */}
                  {/*
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                       <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Visit Us</h3>
                       <p className="text-muted-foreground">
                        123 Pulse Avenue<br/>
                        Innovation City, CA 94000<br/>
                        United States
                       </p>
                    </div>
                  </div>
                  */}

                   {/* Business Hours */}
                   <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                       <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Support Hours</h3>
                       <p className="text-muted-foreground text-lg">
                        Monday - Friday: 9:00 AM - 5:00 PM PST
                       </p>
                    </div>
                  </div>
                </div>
             </div>
           </div>
         </div>
       </section>
     </div>
   );
}
