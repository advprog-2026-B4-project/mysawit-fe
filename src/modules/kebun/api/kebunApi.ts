import apiClient from "@/lib/api/client";

export type KebunUserRole = "MANDOR" | "SUPIR" | "BURUH" | "ADMIN";

export interface CoordinateDTO {
  lat: number;
  lng: number;
}

export interface KebunDTO {
  kebunId: string;
  nama: string;
  kode: string;
  luas: number;
  coordinates: CoordinateDTO[];
}

export interface CreateKebunRequest {
  nama: string;
  kode: string;
  luas: number;
  coordinates: CoordinateDTO[];
}

export interface EditKebunRequest {
  nama: string;
  luas: number;
  coordinates: CoordinateDTO[];
}

export interface AssignPersonRequest {
  personId: string;
}

export interface MandorAssignmentDTO {
  mandorId: string | null;
}

export interface KebunUserDTO {
  userId: string;
  username: string;
  name: string;
  role: KebunUserRole;
  email: string;
}

export const kebunApi = {
  listKebun: async (searchNama?: string, searchKode?: string): Promise<KebunDTO[]> => {
    const { data } = await apiClient.get<KebunDTO[]>("/api/kebun", {
      params: {
        nama: searchNama || undefined,
        kode: searchKode || undefined,
      },
    });
    return data;
  },

  getKebunById: async (kebunId: string): Promise<KebunDTO> => {
    const { data } = await apiClient.get<KebunDTO>(`/api/kebun/${kebunId}`);
    return data;
  },

  createKebun: async (payload: CreateKebunRequest): Promise<KebunDTO> => {
    const { data } = await apiClient.post<KebunDTO>("/api/kebun", payload);
    return data;
  },

  editKebun: async (kebunId: string, payload: EditKebunRequest): Promise<KebunDTO> => {
    const { data } = await apiClient.put<KebunDTO>(`/api/kebun/${kebunId}`, payload);
    return data;
  },

  deleteKebun: async (kebunId: string): Promise<void> => {
    await apiClient.delete(`/api/kebun/${kebunId}`);
  },

  getMandorByKebun: async (kebunId: string): Promise<MandorAssignmentDTO> => {
    const { data } = await apiClient.get<MandorAssignmentDTO>(`/api/kebun/${kebunId}/mandor`);
    return data;
  },

  getSupirList: async (kebunId: string, searchNama?: string): Promise<KebunUserDTO[]> => {
    const { data } = await apiClient.get<KebunUserDTO[]>(`/api/kebun/${kebunId}/supir`, {
      params: {
        nama: searchNama || undefined,
      },
    });
    return data;
  },

  getBuruhList: async (kebunId: string, searchNama?: string): Promise<KebunUserDTO[]> => {
    const { data } = await apiClient.get<KebunUserDTO[]>(`/api/kebun/${kebunId}/buruh`, {
      params: {
        nama: searchNama || undefined,
      },
    });
    return data;
  },

  assignMandorToKebun: async (mandorId: string, kebunId: string): Promise<void> => {
    const payload: AssignPersonRequest = {
      personId: mandorId,
    };
    await apiClient.post(`/api/kebun/${kebunId}/assign/mandor`, payload);
  },

  moveMandorToKebun: async (mandorId: string, newKebunId: string): Promise<void> => {
    const payload: AssignPersonRequest = {
      personId: mandorId,
    };
    await apiClient.post(`/api/kebun/${newKebunId}/move/mandor`, payload);
  },

  assignSupirToKebun: async (supirId: string, kebunId: string): Promise<void> => {
    const payload: AssignPersonRequest = {
      personId: supirId,
    };
    await apiClient.post(`/api/kebun/${kebunId}/assign/supir`, payload);
  },

  moveSupirToKebun: async (supirId: string, newKebunId: string): Promise<void> => {
    const payload: AssignPersonRequest = {
      personId: supirId,
    };
    await apiClient.post(`/api/kebun/${newKebunId}/move/supir`, payload);
  },

  listUsersByRole: async (role: Extract<KebunUserRole, "MANDOR" | "SUPIR">): Promise<KebunUserDTO[]> => {
    const { data } = await apiClient.get<KebunUserDTO[]>("/api/users", {
      params: { role },
    });
    return data;
  },

  getUserById: async (userId: string): Promise<KebunUserDTO> => {
    const { data } = await apiClient.get<KebunUserDTO>(`/api/users/${userId}`);
    return data;
  },
} as const;