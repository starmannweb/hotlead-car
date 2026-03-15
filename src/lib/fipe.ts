/**
 * FIPE brand helpers and brand logos.
 * Uses Simple Icons (transparent SVG logos).
 */

export interface FipeBrand {
    code: string;
    name: string;
    logo: string;
}

function simpleIcon(slug: string, color?: string): string {
    return color
        ? `https://cdn.simpleicons.org/${slug}/${color}`
        : `https://cdn.simpleicons.org/${slug}`;
}

function wikimediaLogo(fileName: string): string {
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
}

type SimpleIconDef = { slug: string; color?: string };

const BRAND_SIMPLE_ICONS: Record<string, SimpleIconDef> = {
    "audi": { slug: "audi", color: "BB0A30" },
    "bmw": { slug: "bmw", color: "0066B1" },
    "byd": { slug: "byd", color: "EA212E" },
    "chery": { slug: "chery", color: "D71921" },
    "caoa chery": { slug: "chery", color: "D71921" },
    "chevrolet": { slug: "chevrolet", color: "CD9834" },
    "gm - chevrolet": { slug: "chevrolet", color: "CD9834" },
    "citroen": { slug: "citroen", color: "DA291C" },
    "fiat": { slug: "fiat", color: "941711" },
    "ford": { slug: "ford", color: "003478" },
    "gwm": { slug: "greatwall", color: "CC0000" },
    "great wall": { slug: "greatwall", color: "CC0000" },
    "honda": { slug: "honda", color: "E40521" },
    "hyundai": { slug: "hyundai", color: "002C5F" },
    "jaguar": { slug: "jaguar", color: "000000" },
    "jeep": { slug: "jeep", color: "000000" },
    "kia": { slug: "kia", color: "05141F" },
    "kia motors": { slug: "kia", color: "05141F" },
    "land rover": { slug: "landrover", color: "005A2B" },
    "lexus": { slug: "lexus", color: "000000" },
    "mercedes-benz": { slug: "mercedes", color: "000000" },
    "mini": { slug: "mini", color: "000000" },
    "mitsubishi": { slug: "mitsubishi", color: "E60012" },
    "nissan": { slug: "nissan", color: "C3002F" },
    "peugeot": { slug: "peugeot", color: "005AA6" },
    "porsche": { slug: "porsche", color: "B12B28" },
    "ram": { slug: "ram", color: "000000" },
    "renault": { slug: "renault", color: "FFCC33" },
    "subaru": { slug: "subaru", color: "013C74" },
    "suzuki": { slug: "suzuki", color: "E30613" },
    "toyota": { slug: "toyota", color: "EB0A1E" },
    "volkswagen": { slug: "volkswagen", color: "001E50" },
    "vw - volkswagen": { slug: "volkswagen", color: "001E50" },
    "volvo": { slug: "volvo", color: "003057" },
};

const BRAND_ICON_BY_CODE: Record<string, string> = {
    "23": "chevrolet",
    "21": "fiat",
    "59": "volkswagen",
    "22": "ford",
    "25": "honda",
    "26": "hyundai",
    "56": "toyota",
    "29": "jeep",
    "48": "renault",
    "43": "nissan",
    "31": "kia",
    "41": "mitsubishi",
    "44": "peugeot",
    "13": "citroen",
    "7": "bmw",
    "39": "mercedes-benz",
    "6": "audi",
    "58": "volvo",
    "55": "suzuki",
    "238": "byd",
    "240": "gwm",
    "185": "ram",
    "245": "caoa chery",
    "54": "subaru",
    "47": "porsche",
    "33": "land rover",
    "28": "jaguar",
    "34": "lexus",
};

function simpleLogoByKey(key: string): string | null {
    const icon = BRAND_SIMPLE_ICONS[key];
    if (!icon) return null;
    return simpleIcon(icon.slug, icon.color);
}

const BRAND_WIKIMEDIA_FILES: Record<string, string> = {
    "byd": "BYD Auto 2022 logo.svg",
    "chery": "Chery logo.svg",
    "caoa chery": "Chery logo.svg",
    "fiat": "FIAT logo (2020).svg",
    "chevrolet": "Chevrolet bowtie 2023.svg",
    "gm - chevrolet": "Chevrolet bowtie 2023.svg",
    "land rover": "Land Rover 1978 logo.svg",
    "jaguar": "Jaguar 1979 logo.svg",
    "lexus": "Lexus.svg",
    "mercedes-benz": "Mercedes-Benz Star (1969-1986, 2025-).svg",
    "volkswagen": "Volkswagen logo 2019.svg",
    "vw - volkswagen": "Volkswagen logo 2019.svg",
    "kia": "KIA logo3.svg",
    "kia motors": "KIA logo3.svg",
    "renault": "Renault 2021.svg",
    "peugeot": "Peugeot Logo.svg",
    "gwm": "GWM 2025 logo.svg",
    "great wall": "GWM 2025 logo.svg",
};

function officialLogoByKey(key: string): string | null {
    const file = BRAND_WIKIMEDIA_FILES[key];
    if (!file) return null;
    return wikimediaLogo(file);
}

function preferredLogoByKey(key: string): string {
    return officialLogoByKey(key) || simpleLogoByKey(key) || "";
}

// Popular brands in Brazil with transparent SVG logos.
export const POPULAR_BRANDS: FipeBrand[] = [
    { code: "23", name: "GM - Chevrolet", logo: preferredLogoByKey("gm - chevrolet") },
    { code: "21", name: "Fiat", logo: preferredLogoByKey("fiat") },
    { code: "59", name: "VW - VolksWagen", logo: preferredLogoByKey("vw - volkswagen") },
    { code: "22", name: "Ford", logo: preferredLogoByKey("ford") },
    { code: "25", name: "Honda", logo: preferredLogoByKey("honda") },
    { code: "26", name: "Hyundai", logo: preferredLogoByKey("hyundai") },
    { code: "56", name: "Toyota", logo: preferredLogoByKey("toyota") },
    { code: "29", name: "Jeep", logo: preferredLogoByKey("jeep") },
    { code: "48", name: "Renault", logo: preferredLogoByKey("renault") },
    { code: "43", name: "Nissan", logo: preferredLogoByKey("nissan") },
    { code: "31", name: "Kia Motors", logo: preferredLogoByKey("kia motors") },
    { code: "41", name: "Mitsubishi", logo: preferredLogoByKey("mitsubishi") },
    { code: "44", name: "Peugeot", logo: preferredLogoByKey("peugeot") },
    { code: "13", name: "Citroen", logo: preferredLogoByKey("citroen") },
    { code: "7", name: "BMW", logo: preferredLogoByKey("bmw") },
    { code: "39", name: "Mercedes-Benz", logo: preferredLogoByKey("mercedes-benz") },
    { code: "6", name: "Audi", logo: preferredLogoByKey("audi") },
    { code: "58", name: "Volvo", logo: preferredLogoByKey("volvo") },
    { code: "55", name: "Suzuki", logo: preferredLogoByKey("suzuki") },
    { code: "238", name: "BYD", logo: preferredLogoByKey("byd") },
    { code: "240", name: "GWM", logo: preferredLogoByKey("gwm") },
    { code: "185", name: "RAM", logo: preferredLogoByKey("ram") },
    { code: "245", name: "Caoa Chery", logo: preferredLogoByKey("caoa chery") },
    { code: "54", name: "Subaru", logo: preferredLogoByKey("subaru") },
    { code: "47", name: "Porsche", logo: preferredLogoByKey("porsche") },
    { code: "33", name: "Land Rover", logo: preferredLogoByKey("land rover") },
    { code: "28", name: "Jaguar", logo: preferredLogoByKey("jaguar") },
    { code: "34", name: "Lexus", logo: preferredLogoByKey("lexus") },
];

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
        const keyByCode = BRAND_ICON_BY_CODE[brand.code];
        if (keyByCode) {
            const byCodePreferred = preferredLogoByKey(keyByCode);
            if (byCodePreferred) return byCodePreferred;
        }

        const byCode = POPULAR_BRANDS.find((b) => b.code === brand.code);
        if (byCode?.logo) return byCode.logo;
    }

    const display = normalizeBrand(getDisplayName(brand.name));
    const displayPreferred = preferredLogoByKey(display);
    if (displayPreferred) return displayPreferred;

    const raw = normalizeBrand(brand.name);
    const rawPreferred = preferredLogoByKey(raw);
    if (rawPreferred) return rawPreferred;

    return brand.logo || "";
}
