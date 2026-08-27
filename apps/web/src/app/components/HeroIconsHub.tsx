'use client';

import React from 'react';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  PhoneIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CpuChipIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  CreditCardIcon,
  CheckCircleIcon,
  Bars3Icon,
  PaperAirplaneIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TvIcon,
  HomeIcon as HomeIconHero,
  MusicalNoteIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  FireIcon,
  StarIcon,
  ArrowsRightLeftIcon,
  VideoCameraIcon,
  ClockIcon,
  MapPinIcon,
  ShareIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  GiftIcon,
  BoltIcon,
  ArrowTopRightOnSquareIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  TagIcon,
  SunIcon,
  MoonIcon,
  FunnelIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  DeviceTabletIcon,
  CameraIcon,
  PrinterIcon,
  WifiIcon,
  Battery50Icon,
  LockClosedIcon,
  ShoppingBagIcon,
  TrophyIcon,
  WrenchIcon,
  ShieldExclamationIcon,
  EyeIcon,
  EyeSlashIcon,
  BanknotesIcon,
  PlusIcon,
  MinusIcon,
  CalendarIcon,
  NewspaperIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

import {
  HeartIcon as HeartSolid,
  StarIcon as StarSolid,
  CheckCircleIcon as CheckCircleSolid,
  SparklesIcon as SparklesSolid,
  PlayIcon as PlaySolid,
} from '@heroicons/react/24/solid';

// Aliases matching standard names
export const Search = MagnifyingGlassIcon;
export const ShoppingCart = ShoppingCartIcon;
export const ShoppingBag = ShoppingBagIcon;
export const Heart = HeartIcon;
export const User = UserIcon;
export const PhoneCall = PhoneIcon;
export const Phone = PhoneIcon;
export const Percent = TagIcon;
export const Truck = TruckIcon;
export const ShieldCheck = ShieldCheckIcon;
export const Sparkles = SparklesIcon;
export const Bot = CpuChipIcon;
export const ChevronRight = ChevronRightIcon;
export const ChevronLeft = ChevronLeftIcon;
export const ChevronDown = ChevronDownIcon;
export const ChevronUp = ChevronUpIcon;
export const X = XMarkIcon;
export const CreditCard = CreditCardIcon;
export const CheckCircle = CheckCircleIcon;
export const CheckCircle2 = CheckCircleIcon;
export const Menu = Bars3Icon;
export const Send = PaperAirplaneIcon;
export const Smartphone = DevicePhoneMobileIcon;
export const Laptop = ComputerDesktopIcon;
export const Tv = TvIcon;
export const Home = HomeIconHero;
export const Headphones = MusicalNoteIcon;
export const ArrowRight = ArrowRightIcon;
export const ArrowLeft = ArrowLeftIcon;
export const Flame = FireIcon;
export const Star = StarIcon;
export const Scale = ArrowsRightLeftIcon;
export const Video = VideoCameraIcon;
export const Clock = ClockIcon;
export const MapPin = MapPinIcon;
export const Share2 = ShareIcon;
export const Globe = GlobeAltIcon;
export const MessageCircle = ChatBubbleLeftRightIcon;
export const Mail = EnvelopeIcon;
export const Gift = GiftIcon;
export const Zap = BoltIcon;
export const ExternalLink = ArrowTopRightOnSquareIcon;
export const MousePointer = CursorArrowRaysIcon;
export const TrendingUp = ArrowTrendingUpIcon;
export const Package = CubeIcon;
export const BadgePercent = TagIcon;
export const Sun = SunIcon;
export const Moon = MoonIcon;
export const Filter = FunnelIcon;
export const RotateCcw = ArrowPathIcon;
export const RefreshCw = ArrowPathIcon;
export const SlidersHorizontal = AdjustmentsHorizontalIcon;
export const Check = CheckIcon;
export const Tablet = DeviceTabletIcon;
export const Monitor = ComputerDesktopIcon;
export const Cpu = CpuChipIcon;
export const HardDrive = CubeIcon;
export const Speaker = MusicalNoteIcon;
export const Camera = CameraIcon;
export const Radio = MusicalNoteIcon;
export const Printer = PrinterIcon;
export const Joystick = SparklesIcon;
export const Wifi = WifiIcon;
export const BatteryCharging = Battery50Icon;
export const Plug = BoltIcon;
export const Fan = SparklesIcon;
export const Thermometer = SparklesIcon;
export const Droplets = SparklesIcon;
export const Microwave = HomeIconHero;
export const Lightbulb = SparklesIcon;
export const Lock = LockClosedIcon;
export const Stethoscope = SparklesIcon;
export const Smile = SparklesIcon;
export const Glasses = SparklesIcon;
export const Car = TruckIcon;
export const Compass = MapPinIcon;
export const Dumbbell = SparklesIcon;
export const Tent = HomeIconHero;
export const Bed = HomeIconHero;
export const Box = CubeIcon;
export const Tag = TagIcon;
export const Award = TrophyIcon;
export const Music = MusicalNoteIcon;
export const Wrench = WrenchIcon;
export const Hammer = WrenchIcon;
export const Shield = ShieldCheckIcon;
export const Battery = Battery50Icon;
export const CircleDot = CheckCircleIcon;
export const Gamepad2 = SparklesIcon;
export const Coffee = SparklesIcon;
export const Watch = ClockIcon;
export const Utensils = SparklesIcon;
export const Scissors = SparklesIcon;
export const Armchair = HomeIconHero;
export const Bike = TruckIcon;
export const Shirt = SparklesIcon;
export const Grid = CubeIcon;
export const Layers = CubeIcon;
export const List = Bars3Icon;
export const SearchX = MagnifyingGlassIcon;
export const AlertTriangle = ShieldExclamationIcon;
export const AlertCircle = ShieldExclamationIcon;
export const Info = SparklesIcon;
export const HelpCircle = ChatBubbleLeftRightIcon;
export const Eye = EyeIcon;
export const EyeOff = EyeSlashIcon;
export const FileText = CubeIcon;
export const Plus = PlusIcon;
export const Minus = MinusIcon;
export const DollarSign = BanknotesIcon;
export const Calendar = CalendarIcon;
export const Newspaper = NewspaperIcon;
export const ArrowUpDown = ArrowsRightLeftIcon;
export const Edit2 = WrenchIcon;
export const Trash2 = XMarkIcon;
export const XCircle = XMarkIcon;
export const Users = UserIcon;
export const Copy = CubeIcon;
export const MousePointerClick = CursorArrowRaysIcon;
export const Link = ArrowTopRightOnSquareIcon;
export const Rocket = FireIcon;
export const Database = CubeIcon;
export const Save = CheckIcon;
export const QrCode = CubeIcon;
export const Scan = CubeIcon;
export const FolderTree = CubeIcon;
export const Wind = SparklesIcon;
export const HeartPulse = SparklesIcon;
export const RotateCw = ArrowPathIcon;
export const Calculator = CubeIcon;
export const Navigation = MapPinIcon;
export const Building2 = HomeIconHero;
export const Store = HomeIconHero;
export const Play = PlayIcon;
export const Sliders = AdjustmentsHorizontalIcon;
