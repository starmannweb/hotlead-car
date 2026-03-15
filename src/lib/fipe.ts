/**
 * FIPE brand helpers and brand logos.
 * Uses an automotive logotype CDN first, with Clearbit as fallback.
 */

export interface FipeBrand {
    code: string;
    name: string;
    logo: string;
}

function officialLogo(slug: string): string {
    return `https://vl.imgix.net/img/${slug}-logo.png?auto=format,compress&fit=fill&w=180&h=180&bg=ffffff00`;
}

// Popular brands in Brazil with priority logos.
export const POPULAR_BRANDS: FipeBrand[] = [
    { code: "23", name: "GM - Chevrolet", logo: officialLogo("chevrolet") },
    { code: "21", name: "Fiat", logo: officialLogo("fiat") },
    { code: "59", name: "VW - VolksWagen", logo: officialLogo("volkswagen") },
    { code: "22", name: "Ford", logo: officialLogo("ford") },
    { code: "25", name: "Honda", logo: officialLogo("honda") },
    { code: "26", name: "Hyundai", logo: officialLogo("hyundai") },
    { code: "56", name: "Toyota", logo: officialLogo("toyota") },
    { code: "29", name: "Jeep", logo: officialLogo("jeep") },
    { code: "48", name: "Renault", logo: officialLogo("renault") },
    { code: "43", name: "Nissan", logo: officialLogo("nissan") },
    { code: "31", name: "Kia Motors", logo: officialLogo("kia") },
    { code: "41", name: "Mitsubishi", logo: officialLogo("mitsubishi") },
    { code: "44", name: "Peugeot", logo: officialLogo("peugeot") },
    { code: "13", name: "Citroen", logo: officialLogo("citroen") },
    { code: "7", name: "BMW", logo: officialLogo("bmw") },
    { code: "39", name: "Mercedes-Benz", logo: officialLogo("mercedes-benz") },
    { code: "6", name: "Audi", logo: officialLogo("audi") },
    { code: "58", name: "Volvo", logo: officialLogo("volvo") },
    { code: "55", name: "Suzuki", logo: officialLogo("suzuki") },
    { code: "238", name: "BYD", logo: officialLogo("byd") },
    { code: "240", name: "GWM", logo: officialLogo("great-wall") },
    { code: "185", name: "RAM", logo: officialLogo("ram") },
    { code: "245", name: "Caoa Chery", logo: officialLogo("chery") },
    { code: "54", name: "Subaru", logo: officialLogo("subaru") },
    { code: "47", name: "Porsche", logo: officialLogo("porsche") },
    { code: "33", name: "Land Rover", logo: officialLogo("land-rover") },
    { code: "28", name: "Jaguar", logo: officialLogo("jaguar") },
    { code: "34", name: "Lexus", logo: officialLogo("lexus") },
];

const OFFICIAL_BRAND_LOGOS: Record<string, string> = {
    "audi": officialLogo("audi"),
    "bmw": officialLogo("bmw"),
    "byd": officialLogo("byd"),
    "chery": officialLogo("chery"),
    "caoa chery": officialLogo("chery"),
    "chevrolet": officialLogo("chevrolet"),
    "gm - chevrolet": officialLogo("chevrolet"),
    "citroen": officialLogo("citroen"),
    "fiat": officialLogo("fiat"),
    "ford": officialLogo("ford"),
    "gwm": officialLogo("great-wall"),
    "great wall": officialLogo("great-wall"),
    "honda": officialLogo("honda"),
    "hyundai": officialLogo("hyundai"),
    "jaguar": officialLogo("jaguar"),
    "jeep": officialLogo("jeep"),
    "kia": officialLogo("kia"),
    "kia motors": officialLogo("kia"),
    "land rover": officialLogo("land-rover"),
    "lexus": officialLogo("lexus"),
    "mercedes-benz": officialLogo("mercedes-benz"),
    "mini": officialLogo("mini"),
    "mitsubishi": officialLogo("mitsubishi"),
    "nissan": officialLogo("nissan"),
    "peugeot": officialLogo("peugeot"),
    "porsche": officialLogo("porsche"),
    "ram": officialLogo("ram"),
    "renault": officialLogo("renault"),
    "subaru": officialLogo("subaru"),
    "suzuki": officialLogo("suzuki"),
    "toyota": officialLogo("toyota"),
    "volkswagen": officialLogo("volkswagen"),
    "vw - volkswagen": officialLogo("volkswagen"),
    "volvo": officialLogo("volvo"),
};

const CLEARBIT_FALLBACK: Record<string, string> = {
    "chery": "https://logo.clearbit.com/cheryinternational.com",
    "caoa chery": "https://logo.clearbit.com/cheryinternational.com",
    "mini": "https://logo.clearbit.com/mini.com",
    "ram": "https://logo.clearbit.com/ramtrucks.com",
    "mercedes-benz": "https://logo.clearbit.com/mercedes-benz.com",
    "volkswagen": "https://logo.clearbit.com/volkswagen.com",
    "gwm": "https://logo.clearbit.com/gwm.com.br",
};

// Simplified brand names for UI labels.
export function getDisplayName(fipeName: string): string {
    const map: Record<string, string> = {
        "GM - Chevrolet": "Chevrolet",
        "VW - VolksWagen": "Volkswagen",
        "Kia Motors": "Kia",
        "Caoa Chery": "Chery",
    };
    return map[fipeName] || fipeName;
}

function normalizeBrand(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export function resolveBrandLogo(brand: { code?: string; name: string; logo?: string }): string {
    if (brand.code) {
        const byCode = POPULAR_BRANDS.find((b) => b.code === brand.code);
        if (byCode?.logo) return byCode.logo;
    }

    const display = normalizeBrand(getDisplayName(brand.name));
    if (OFFICIAL_BRAND_LOGOS[display]) return OFFICIAL_BRAND_LOGOS[display];
    if (CLEARBIT_FALLBACK[display]) return CLEARBIT_FALLBACK[display];

    const raw = normalizeBrand(brand.name);
    if (OFFICIAL_BRAND_LOGOS[raw]) return OFFICIAL_BRAND_LOGOS[raw];
    if (CLEARBIT_FALLBACK[raw]) return CLEARBIT_FALLBACK[raw];

    return brand.logo || "";
}
