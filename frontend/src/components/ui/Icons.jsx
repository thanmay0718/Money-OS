// src/components/ui/Icons.jsx — Apple-inspired iconography via Lucide React
import React from 'react'
import * as LucideIcons from 'lucide-react'

/**
 * Higher-order component to ensure consistent Apple SF Symbol-like precision:
 * - Outline style
 * - Default strokeWidth: 1.85
 * - Default size: 20px
 * - Consistent bounding box and optical weight
 */
const createAppleIcon = (LucideComponent, defaultSize = 20) => {
  return function AppleIcon({
    className = 'w-5 h-5',
    size = defaultSize,
    strokeWidth = 1.85,
    ...props
  }) {
    if (!LucideComponent) {
      return null
    }
    return (
      <LucideComponent
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
        {...props}
      />
    )
  }
}

// ── Global Icon Mapping Required by MoneyOS ──────────────────────────────
export const LayoutDashboard     = createAppleIcon(LucideIcons.LayoutDashboard, 20)
export const ArrowLeftRight       = createAppleIcon(LucideIcons.ArrowLeftRight, 20)
export const TrendingUp          = createAppleIcon(LucideIcons.TrendingUp, 20)
export const TrendingDown        = createAppleIcon(LucideIcons.TrendingDown, 20)
export const Wallet              = createAppleIcon(LucideIcons.Wallet, 20)
export const Target              = createAppleIcon(LucideIcons.Target, 20)
export const Tags                = createAppleIcon(LucideIcons.Tags, 20)
export const ChartNoAxesCombined = createAppleIcon(LucideIcons.ChartNoAxesCombined, 20)
export const Settings2           = createAppleIcon(LucideIcons.Settings2, 20)
export const Search              = createAppleIcon(LucideIcons.Search, 18)
export const Bell                = createAppleIcon(LucideIcons.Bell, 20)
export const UserRound           = createAppleIcon(LucideIcons.UserRound, 20)
export const Plus                = createAppleIcon(LucideIcons.Plus, 18)
export const CirclePlus          = createAppleIcon(LucideIcons.CirclePlus, 20)
export const CalendarDays        = createAppleIcon(LucideIcons.CalendarDays, 18)
export const ChevronLeft         = createAppleIcon(LucideIcons.ChevronLeft, 18)
export const ChevronRight        = createAppleIcon(LucideIcons.ChevronRight, 18)
export const ChevronDown         = createAppleIcon(LucideIcons.ChevronDown, 18)
export const X                   = createAppleIcon(LucideIcons.X, 18)
export const Pencil              = createAppleIcon(LucideIcons.Pencil, 16)
export const Trash2              = createAppleIcon(LucideIcons.Trash2, 16)
export const Check               = createAppleIcon(LucideIcons.Check, 18)
export const Info                = createAppleIcon(LucideIcons.Info, 18)
export const TriangleAlert       = createAppleIcon(LucideIcons.TriangleAlert, 18)
export const CircleCheck         = createAppleIcon(LucideIcons.CircleCheck, 18)
export const CircleX             = createAppleIcon(LucideIcons.CircleX, 18)
export const LoaderCircle        = createAppleIcon(LucideIcons.LoaderCircle, 18)
export const CircleHelp          = createAppleIcon(LucideIcons.CircleHelp, 18)
export const ArrowLeft           = createAppleIcon(LucideIcons.ArrowLeft, 18)
export const ArrowRight          = createAppleIcon(LucideIcons.ArrowRight, 18)
export const Sparkles            = createAppleIcon(LucideIcons.Sparkles, 18)
export const ShieldCheck         = createAppleIcon(LucideIcons.ShieldCheck, 20)
export const Shield              = createAppleIcon(LucideIcons.Shield, 20)

// ── Additional Admin & Extended System Icons ────────────────────────────
export const UsersRound          = createAppleIcon(LucideIcons.UsersRound, 20)
export const UserRoundCog        = createAppleIcon(LucideIcons.UserRoundCog, 20)
export const ClipboardList       = createAppleIcon(LucideIcons.ClipboardList, 20)
export const Activity            = createAppleIcon(LucideIcons.Activity, 20)
export const Download            = createAppleIcon(LucideIcons.Download, 18)
export const SlidersHorizontal   = createAppleIcon(LucideIcons.SlidersHorizontal, 18)
export const RefreshCw           = createAppleIcon(LucideIcons.RefreshCw, 18)
export const LogOut              = createAppleIcon(LucideIcons.LogOut, 18)
export const CreditCard          = createAppleIcon(LucideIcons.CreditCard, 20)
export const Lock                = createAppleIcon(LucideIcons.Lock, 18)
export const Mail                = createAppleIcon(LucideIcons.Mail, 18)
export const Eye                 = createAppleIcon(LucideIcons.Eye, 18)
export const EyeOff              = createAppleIcon(LucideIcons.EyeOff, 18)
export const Menu                = createAppleIcon(LucideIcons.Menu, 20)
export const Sliders             = createAppleIcon(LucideIcons.Sliders, 18)

// ── Onboarding & Extended Feature Icons ─────────────────────────────────
export const GraduationCap       = createAppleIcon(LucideIcons.GraduationCap, 20)
export const Rocket              = createAppleIcon(LucideIcons.Rocket, 20)
export const Briefcase           = createAppleIcon(LucideIcons.Briefcase, 20)
export const Award               = createAppleIcon(LucideIcons.Award, 20)
export const Hammer              = createAppleIcon(LucideIcons.Hammer, 20)
export const Palmtree            = createAppleIcon(LucideIcons.Palmtree, 20)
export const BarChart3           = createAppleIcon(LucideIcons.BarChart3, 20)
export const Shuffle             = createAppleIcon(LucideIcons.Shuffle, 20)
export const Banknote            = createAppleIcon(LucideIcons.Banknote, 20)
export const Hourglass           = createAppleIcon(LucideIcons.Hourglass, 20)
export const Home                = createAppleIcon(LucideIcons.Home, 20)
export const Key                 = createAppleIcon(LucideIcons.Key, 20)
export const Building2           = createAppleIcon(LucideIcons.Building2, 20)
export const House               = createAppleIcon(LucideIcons.House, 20)
export const Handshake           = createAppleIcon(LucideIcons.Handshake, 20)
export const BedDouble           = createAppleIcon(LucideIcons.BedDouble, 20)
export const Package             = createAppleIcon(LucideIcons.Package, 20)
export const User                = createAppleIcon(LucideIcons.User, 20)
export const Heart               = createAppleIcon(LucideIcons.Heart, 20)
export const Baby                = createAppleIcon(LucideIcons.Baby, 20)
export const Car                 = createAppleIcon(LucideIcons.Car, 20)
export const Hospital            = createAppleIcon(LucideIcons.Hospital, 20)
export const Sprout              = createAppleIcon(LucideIcons.Sprout, 20)
export const Gem                 = createAppleIcon(LucideIcons.Gem, 20)
export const Palette             = createAppleIcon(LucideIcons.Palette, 20)
export const Coins               = createAppleIcon(LucideIcons.Coins, 20)
export const Medal               = createAppleIcon(LucideIcons.Medal, 20)
export const Plane               = createAppleIcon(LucideIcons.Plane, 20)
export const ShoppingBag         = createAppleIcon(LucideIcons.ShoppingBag, 20)
export const Waves               = createAppleIcon(LucideIcons.Waves, 20)
export const Scale               = createAppleIcon(LucideIcons.Scale, 20)
export const Compass             = createAppleIcon(LucideIcons.Compass, 20)
export const ShieldAlert         = createAppleIcon(LucideIcons.ShieldAlert, 20)
export const ImagePlus           = createAppleIcon(LucideIcons.ImagePlus, 20)
export const Image               = createAppleIcon(LucideIcons.Image, 20)
export const Upload              = createAppleIcon(LucideIcons.Upload, 20)
export const ListOrdered         = createAppleIcon(LucideIcons.ListOrdered, 20)
export const AlertTriangle       = createAppleIcon(LucideIcons.AlertTriangle, 20)
export const ClipboardCheck      = createAppleIcon(LucideIcons.ClipboardCheck, 20)
export const CircleDot           = createAppleIcon(LucideIcons.CircleDot, 20)
export const Landmark            = createAppleIcon(LucideIcons.Landmark, 20)
export const Utensils            = createAppleIcon(LucideIcons.Utensils, 20)
export const Film                = createAppleIcon(LucideIcons.Film, 20)
export const Zap                 = createAppleIcon(LucideIcons.Zap, 20)
export const Filter              = createAppleIcon(LucideIcons.Filter, 18)
export const Clock               = createAppleIcon(LucideIcons.Clock, 18)
export const PieChart            = createAppleIcon(LucideIcons.PieChart, 18)
export const ArrowUpDown         = createAppleIcon(LucideIcons.ArrowUpDown, 18)
export const ExternalLink        = createAppleIcon(LucideIcons.ExternalLink, 18)

// ── Compatibility Aliases for Existing App Code ─────────────────────────
export const CheckCircle         = CircleCheck
export const CheckCircle2        = CircleCheck
export const AlertCircle         = TriangleAlert
export const SearchIcon          = Search
export const HomeIcon            = LayoutDashboard
export const ReceiptIcon         = ArrowLeftRight
export const PocketIcon          = Wallet
export const CategoryIcon        = Tags
export const ChartBarIcon        = ChartNoAxesCombined
export const CogIcon             = Settings2
