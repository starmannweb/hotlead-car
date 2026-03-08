import { LeadData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/leads";

export async function submitLead(data: LeadData): Promise<{ success: boolean; message: string }> {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "photos") return;
      formData.append(key, value as string);
    });

    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photo) => {
        formData.append("photos[]", photo);
      });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro ao enviar dados");
    }

    return { success: true, message: "Lead enviado com sucesso!" };
  } catch (error) {
    console.error("Erro ao enviar lead:", error);
    return { success: false, message: "Erro ao enviar. Tente novamente." };
  }
}
