"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, Plus, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

function NavLink({
  href,
  children,
  active,
  className,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-2 py-1 rounded-md text-sm transition-colors",
        active
          ? "bg-muted font-medium"
          : "hover:bg-muted/60",
        className
      )}
    >
      {children}
    </Link>
  );
}

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    (async () => setEmail((await supabase.auth.getUser()).data.user?.email ?? null))();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setEmail(s?.user?.email ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const sections = useMemo(
    () => [
      {
        label: "Data",
        items: [
          { href: "/companies", label: "Companies" },
          { href: "/products", label: "Products" },
          { href: "/listings", label: "Listings" },
        ],
      },
      {
        label: "Trade",
        items: [
          { href: "/rfqs", label: "RFQs" },
          { href: "/quotes", label: "Quotes" },
          { href: "/messages", label: "Messages" },
        ],
      },
      {
        label: "Compliance",
        items: [
          { href: "/kyc", label: "KYC" },
          { href: "/reviews", label: "Reviews" },
        ],
      },
    ],
    []
  );

  const createLinks = [
    { href: "/companies/new", label: "New company" },
    { href: "/products/new", label: "New product" },
    { href: "/listings/new", label: "New listing" },
    { href: "/rfqs/new", label: "New RFQ" },
    { href: "/quotes/new", label: "New quote" },
    { href: "/messages/new", label: "New message" },
    { href: "/reviews/new", label: "New review" },
    { href: "/kyc/new", label: "New KYC doc" },
  ];

  return (
    <header className="border-b bg-background">
      <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Brand */}
        <Link href="/" className="font-semibold hover:opacity-90">
          Fournisseur · Importateur
        </Link>

        {/* Desktop: NavigationMenu */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {sections.map((sec) => (
                <NavigationMenuItem key={sec.label}>
                  <NavigationMenuTrigger>{sec.label}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-1 p-2 w-[320px]">
                      {sec.items.map((it) => (
                        <NavigationMenuLink asChild key={it.href}>
                          <NavLink
                            href={it.href}
                            active={pathname?.startsWith(it.href)}
                            className="w-full"
                          >
                            {it.label}
                          </NavLink>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Create dropdown (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" /> Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick create</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {createLinks.map((l) => (
                <DropdownMenuItem key={l.href} asChild>
                  <Link href={l.href}>{l.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth */}
          {email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[10px]">
                      {email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Signed in</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/companies")}>
                  My companies
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => supabase.auth.signOut()}
                >
                  <LogOut className="mr-2 size-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile: Sheet menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0">
              <SheetHeader className="px-4 py-3 items-start">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <Separator />
              <div className="p-3 space-y-4">
                {sections.map((sec) => (
                  <div key={sec.label} className="space-y-2">
                    <div className="px-2 text-xs uppercase text-muted-foreground tracking-wide">
                      {sec.label}
                    </div>
                    <div className="grid">
                      {sec.items.map((it) => (
                        <NavLink
                          key={it.href}
                          href={it.href}
                          active={pathname?.startsWith(it.href)}
                        >
                          {it.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="px-2 text-xs uppercase text-muted-foreground tracking-wide">
                    Create
                  </div>
                  <div className="grid">
                    {createLinks.map((l) => (
                      <NavLink
                        key={l.href}
                        href={l.href}
                        active={pathname === l.href}
                      >
                        {l.label}
                      </NavLink>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  {email ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {email.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{email}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => supabase.auth.signOut()}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
