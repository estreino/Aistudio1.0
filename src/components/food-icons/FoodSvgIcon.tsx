import React from 'react';

interface FoodSvgIconProps {
  iconId: string;
  className?: string;
}

export const FoodSvgIcon: React.FC<FoodSvgIconProps> = ({ iconId, className = 'w-7 h-7' }) => {
  // Renderizadores vetoriais em viewBox 0 0 64 64 padronizado
  switch (iconId) {
    // === CEREAIS & MASSAS ===
    case 'rice_white':
    case 'rice_brown':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="40" rx="22" ry="12" fill={iconId === 'rice_brown' ? '#8D6E63' : '#E2E8F0'} />
          <path d="M10 40C10 50 18 56 32 56C46 56 54 50 54 40" stroke="#94A3B8" strokeWidth="3" fill="#1E293B" />
          <circle cx="28" cy="36" r="3" fill="#FFF" opacity="0.8" />
          <circle cx="36" cy="35" r="3" fill="#FFF" opacity="0.8" />
          <circle cx="32" cy="30" r="3.5" fill="#FFF" />
          <circle cx="24" cy="38" r="2.5" fill="#FFF" opacity="0.8" />
          <circle cx="40" cy="38" r="2.5" fill="#FFF" opacity="0.8" />
          <path d="M26 18L38 28M38 18L26 28" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
      );

    case 'pasta':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 44C12 52 20 56 32 56C44 56 52 52 52 44" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
          <path d="M20 38C22 28 30 26 34 36C38 42 44 38 46 28" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
          <path d="M16 34C20 22 28 34 36 24C40 18 46 22 48 32" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="32" cy="28" r="4" fill="#EF4444" />
        </svg>
      );

    case 'bread_french':
    case 'bread_sliced':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="20" width="36" height="30" rx="8" fill="#D97706" />
          <rect x="16" y="24" width="32" height="24" rx="6" fill="#FDE68A" />
          <path d="M22 20L20 26M32 20L30 26M42 20L40 26" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'oats':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="38" rx="20" ry="10" fill="#FDE047" />
          <path d="M12 38C12 48 20 54 32 54C44 54 52 48 52 38" fill="#1E293B" stroke="#64748B" strokeWidth="3" />
          <ellipse cx="26" cy="34" rx="4" ry="2" fill="#FEF08A" transform="rotate(-20 26 34)" />
          <ellipse cx="36" cy="32" rx="4" ry="2" fill="#FEF08A" transform="rotate(25 36 32)" />
          <ellipse cx="32" cy="24" rx="3.5" ry="6" fill="#CA8A04" />
        </svg>
      );

    case 'tapioca':
    case 'couscous':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M14 42C14 26 26 18 48 22C52 36 42 48 24 48L14 42Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="3" />
          <path d="M20 36C28 32 38 34 42 38" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );

    case 'corn':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="24" y="16" width="16" height="34" rx="8" fill="#EAB308" />
          <circle cx="28" cy="24" r="2" fill="#CA8A04" />
          <circle cx="36" cy="24" r="2" fill="#CA8A04" />
          <circle cx="28" cy="32" r="2" fill="#CA8A04" />
          <circle cx="36" cy="32" r="2" fill="#CA8A04" />
          <circle cx="32" cy="40" r="2" fill="#CA8A04" />
          <path d="M16 46C20 40 22 28 22 20C18 30 16 40 16 46Z" fill="#22C55E" />
          <path d="M48 46C44 40 42 28 42 20C46 30 48 40 48 46Z" fill="#16A34A" />
        </svg>
      );

    // === FEIJÕES & LEGUMINOSAS ===
    case 'beans_black':
    case 'beans_carioca':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="40" rx="20" ry="12" fill={iconId === 'beans_black' ? '#18181B' : '#78350F'} />
          <path d="M12 40C12 50 20 56 32 56C44 56 52 50 52 40" stroke="#64748B" strokeWidth="3" fill="#0F172A" />
          <ellipse cx="26" cy="36" rx="6" ry="4" fill={iconId === 'beans_black' ? '#09090B' : '#B45309'} transform="rotate(-15 26 36)" />
          <ellipse cx="38" cy="36" rx="6" ry="4" fill={iconId === 'beans_black' ? '#09090B' : '#B45309'} transform="rotate(20 38 36)" />
          <circle cx="26" cy="35" r="1.5" fill="#FFF" opacity="0.6" />
        </svg>
      );

    case 'lentils':
    case 'chickpeas':
    case 'peas':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="36" r="8" fill={iconId === 'peas' ? '#22C55E' : '#F59E0B'} />
          <circle cx="38" cy="32" r="9" fill={iconId === 'peas' ? '#16A34A' : '#D97706'} />
          <circle cx="32" cy="44" r="7" fill={iconId === 'peas' ? '#4ADE80' : '#FBBF24'} />
          <circle cx="23" cy="34" r="2" fill="#FFF" opacity="0.5" />
          <circle cx="36" cy="30" r="2.5" fill="#FFF" opacity="0.5" />
        </svg>
      );

    // === TUBÉRCULOS ===
    case 'potato_boiled':
    case 'sweet_potato':
    case 'cassava':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 34C14 24 24 16 38 18C50 20 54 32 50 42C44 50 28 52 18 44C15 40 16 36 16 34Z"
            fill={iconId === 'sweet_potato' ? '#9333EA' : iconId === 'cassava' ? '#78350F' : '#EAB308'}
            stroke="#64748B"
            strokeWidth="2.5"
          />
          <circle cx="26" cy="30" r="1.5" fill="#000" opacity="0.25" />
          <circle cx="36" cy="34" r="1.5" fill="#000" opacity="0.25" />
          <circle cx="42" cy="26" r="1.5" fill="#000" opacity="0.25" />
        </svg>
      );

    // === PROTEÍNAS ===
    case 'chicken_grilled':
    case 'chicken_shredded':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 38C12 28 24 18 36 20C48 22 52 34 46 44C40 50 22 48 16 38Z"
            fill="#D97706"
            stroke="#92400E"
            strokeWidth="2.5"
          />
          <path d="M22 28L30 36M30 26L38 34M38 24L46 32" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="42" y="38" width="14" height="6" rx="3" fill="#F8FAFC" transform="rotate(30 42 38)" />
        </svg>
      );

    case 'beef':
    case 'ground_beef':
    case 'pork':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 36C12 24 22 16 42 18C52 20 54 36 48 44C40 52 20 50 14 36Z"
            fill={iconId === 'pork' ? '#F472B6' : '#B91C1C'}
            stroke="#7F1D1D"
            strokeWidth="2.5"
          />
          <ellipse cx="28" cy="32" rx="4" ry="7" fill="#F8FAFC" opacity="0.85" transform="rotate(25 28 32)" />
        </svg>
      );

    case 'fish':
    case 'tuna':
    case 'sardine':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 32C22 20 40 24 50 32C40 40 22 44 12 32Z"
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth="2.5"
          />
          <path d="M50 32L60 22V42L50 32Z" fill="#0284C7" />
          <circle cx="20" cy="30" r="2.5" fill="#0F172A" />
          <path d="M28 28C30 32 30 34 28 36" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'eggs':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="24" cy="34" rx="10" ry="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="40" cy="34" rx="10" ry="14" fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
          <circle cx="40" cy="34" r="5" fill="#F97316" />
        </svg>
      );

    // === VERDURAS & LEGUMES ===
    case 'lettuce':
    case 'arugula':
    case 'kale':
    case 'spinach':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32 16C20 16 14 26 16 42C18 52 30 54 32 54C34 54 46 52 48 42C50 26 44 16 32 16Z"
            fill="#22C55E"
            stroke="#15803D"
            strokeWidth="2.5"
          />
          <path d="M32 54V24M32 34C36 30 42 32 44 34M32 42C28 38 22 40 20 42" stroke="#15803D" strokeWidth="2" />
        </svg>
      );

    case 'tomato':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="38" r="18" fill="#EF4444" stroke="#B91C1C" strokeWidth="2.5" />
          <circle cx="26" cy="32" r="3" fill="#FFF" opacity="0.4" />
          <path d="M32 20V14M26 18L32 20L38 18" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'broccoli':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="24" r="12" fill="#15803D" />
          <circle cx="22" cy="30" r="10" fill="#16A34A" />
          <circle cx="42" cy="30" r="10" fill="#16A34A" />
          <path d="M28 36V52H36V36" fill="#86EFAC" stroke="#16A34A" strokeWidth="2.5" />
        </svg>
      );

    case 'carrot':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M42 18L20 54L16 48L36 14L42 18Z" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
          <path d="M38 16L48 8M36 14L44 6M40 18L52 14" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    // === FRUTAS ===
    case 'banana':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 44C26 50 44 44 50 20C48 24 36 34 20 34L16 44Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path d="M50 20L54 16" stroke="#713F12" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'apple':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32 24C24 16 14 24 16 38C18 50 28 54 32 50C36 54 46 50 48 38C50 24 40 16 32 24Z"
            fill="#DC2626"
            stroke="#991B1B"
            strokeWidth="2.5"
          />
          <path d="M32 24V14" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 18C36 14 42 16 44 18" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'orange':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="36" r="18" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
          <circle cx="32" cy="18" r="2" fill="#15803D" />
          <circle cx="28" cy="30" r="1.5" fill="#EA580C" />
          <circle cx="36" cy="32" r="1.5" fill="#EA580C" />
        </svg>
      );

    case 'watermelon':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 24C12 44 24 54 32 54C40 54 52 44 52 24H12Z" fill="#15803D" stroke="#166534" strokeWidth="2.5" />
          <path d="M16 26C16 42 26 50 32 50C38 50 48 42 48 26H16Z" fill="#EF4444" />
          <circle cx="24" cy="32" r="1.5" fill="#000" />
          <circle cx="32" cy="38" r="1.5" fill="#000" />
          <circle cx="40" cy="32" r="1.5" fill="#000" />
        </svg>
      );

    // === LATICÍNIOS ===
    case 'milk':
    case 'milk_lactose_free':
    case 'yogurt':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M22 20L26 14H38L42 20V52H22V20Z" fill="#F8FAFC" stroke="#64748B" strokeWidth="2.5" />
          <rect x="22" y="30" width="20" height="12" fill="#38BDF8" />
          <circle cx="32" cy="36" r="3" fill="#FFF" />
        </svg>
      );

    case 'cheese':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 44L48 20V44H12Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
          <circle cx="28" cy="38" r="2.5" fill="#D97706" />
          <circle cx="38" cy="34" r="3" fill="#D97706" />
          <circle cx="42" cy="40" r="2" fill="#D97706" />
        </svg>
      );

    // === GORDURAS ===
    case 'olive_oil':
    case 'oil':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M28 14H36V22L42 30V52H22V30L28 22V14Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2.5" />
          <ellipse cx="32" cy="40" rx="4" ry="6" fill="#F7FEE7" opacity="0.6" />
        </svg>
      );

    case 'butter':
    case 'peanut_butter':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M14 36L26 24H50L40 36H14Z" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
          <rect x="14" y="36" width="26" height="14" fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
        </svg>
      );

    // === BEBIDAS ===
    case 'water':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32 14C32 14 18 32 18 42C18 49.7 24.3 56 32 56C39.7 56 46 49.7 46 42C46 32 32 14 32 14Z"
            fill="#38BDF8"
            stroke="#0284C7"
            strokeWidth="2.5"
          />
          <circle cx="28" cy="42" r="3" fill="#FFF" opacity="0.6" />
        </svg>
      );

    case 'coffee_black':
    case 'coffee_milk':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M16 26H44V42C44 50 36 54 30 54C24 54 16 50 16 42V26Z" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
          <path d="M44 30H50C53 30 54 34 54 38C54 42 53 44 44 44" stroke="#64748B" strokeWidth="2.5" />
          <ellipse cx="30" cy="28" rx="12" ry="3" fill={iconId === 'coffee_milk' ? '#A16207' : '#451A03'} />
          <path d="M26 18C28 14 28 12 26 8M34 18C36 14 36 12 34 8" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'tea':
    case 'juice':
    case 'soda':
    case 'energy_drink':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M20 18H44L40 54H24L20 18Z" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
          <line x1="36" y1="10" x2="28" y2="34" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="40" r="2" fill="#FFF" opacity="0.5" />
        </svg>
      );

    // === DOCES & LANCHES ===
    case 'chocolate':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="18" width="28" height="32" rx="4" fill="#581C87" stroke="#3B0764" strokeWidth="2" />
          <rect x="22" y="22" width="10" height="12" rx="2" fill="#451A03" />
          <rect x="34" y="22" width="10" height="12" rx="2" fill="#451A03" />
          <rect x="22" y="36" width="10" height="12" rx="2" fill="#451A03" />
          <rect x="34" y="36" width="10" height="12" rx="2" fill="#451A03" />
        </svg>
      );

    // === SUPLEMENTOS ===
    case 'whey':
    case 'creatine':
    case 'pre_workout':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="22" width="24" height="32" rx="6" fill="#1E1B4B" stroke="#6366F1" strokeWidth="2.5" />
          <rect x="24" y="16" width="16" height="6" rx="2" fill="#4338CA" />
          <path d="M26 34L32 28L38 34" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="32" y="46" textAnchor="middle" fill="#818CF8" fontSize="8" fontWeight="bold">PRO</text>
        </svg>
      );

    // Ícone genérico para alimentos personalizados
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="20" fill="#1E293B" stroke="#64748B" strokeWidth="2.5" />
          <path d="M26 26L38 38M38 26L26 38" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};
