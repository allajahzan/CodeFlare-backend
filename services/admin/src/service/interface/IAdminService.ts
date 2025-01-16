import { IAdminSchema } from "../../modal/interface/IAdminSchema"

/** Interface for Admin Service */
export interface IAdminService {
    getAdmin(_id: string) : Promise<void>
    updateAdmin(_id: string, admin: IAdminSchema) : Promise<void>
}