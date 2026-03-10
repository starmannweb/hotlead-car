/**
 * Mapeamento de Marcas FIPE com logos
 * As logos usam a CDN car-logos via logo.clearbit.com e logos alternativas
 */

export interface FipeBrand {
    code: string;
    name: string;
    logo: string;
}

// Marcas mais populares no Brasil com seus codigos FIPE
// Logos via logo.clearbit.com (alta qualidade, gratis)
export const POPULAR_BRANDS: FipeBrand[] = [
    { code: "23", name: "GM - Chevrolet", logo: "https://logo.clearbit.com/chevrolet.com" },
    { code: "21", name: "Fiat", logo: "https://logo.clearbit.com/fiat.com" },
    { code: "59", name: "VW - VolksWagen", logo: "https://logo.clearbit.com/volkswagen.com" },
    { code: "22", name: "Ford", logo: "https://logo.clearbit.com/ford.com" },
    { code: "25", name: "Honda", logo: "https://logo.clearbit.com/honda.com" },
    { code: "26", name: "Hyundai", logo: "https://logo.clearbit.com/hyundai.com" },
    { code: "56", name: "Toyota", logo: "https://logo.clearbit.com/toyota.com" },
    { code: "29", name: "Jeep", logo: "https://logo.clearbit.com/jeep.com" },
    { code: "48", name: "Renault", logo: "https://logo.clearbit.com/renault.com" },
    { code: "43", name: "Nissan", logo: "https://logo.clearbit.com/nissan.com" },
    { code: "31", name: "Kia Motors", logo: "https://logo.clearbit.com/kia.com" },
    { code: "41", name: "Mitsubishi", logo: "https://logo.clearbit.com/mitsubishi-motors.com" },
    { code: "44", name: "Peugeot", logo: "https://logo.clearbit.com/peugeot.com" },
    { code: "13", name: "Citroën", logo: "https://logo.clearbit.com/citroen.com" },
    { code: "7", name: "BMW", logo: "https://logo.clearbit.com/bmw.com" },
    { code: "39", name: "Mercedes-Benz", logo: "https://logo.clearbit.com/mercedes-benz.com" },
    { code: "6", name: "Audi", logo: "https://logo.clearbit.com/audi.com" },
    { code: "58", name: "Volvo", logo: "https://logo.clearbit.com/volvocars.com" },
    { code: "55", name: "Suzuki", logo: "https://logo.clearbit.com/suzuki.com" },
    { code: "238", name: "BYD", logo: "https://logo.clearbit.com/byd.com" },
    { code: "240", name: "GWM", logo: "https://logo.clearbit.com/gwm.com.br" },
    { code: "185", name: "RAM", logo: "https://logo.clearbit.com/ramtrucks.com" },
    { code: "245", name: "Caoa Chery", logo: "https://logo.clearbit.com/caoa.com.br" },
    { code: "54", name: "Subaru", logo: "https://logo.clearbit.com/subaru.com" },
    { code: "47", name: "Porsche", logo: "https://logo.clearbit.com/porsche.com" },
    { code: "33", name: "Land Rover", logo: "https://logo.clearbit.com/landrover.com" },
    { code: "28", name: "Jaguar", logo: "https://logo.clearbit.com/jaguar.com" },
    { code: "34", name: "Lexus", logo: "https://logo.clearbit.com/lexus.com" },
];

// Display name simplificado para cada marca
export function getDisplayName(fipeName: string): string {
    const map: Record<string, string> = {
        "GM - Chevrolet": "Chevrolet",
        "VW - VolksWagen": "Volkswagen",
        "Kia Motors": "Kia",
    };
    return map[fipeName] || fipeName;
}
