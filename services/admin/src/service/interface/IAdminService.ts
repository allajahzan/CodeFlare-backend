import { IAdminDto } from "../../dto/adminServiceDto"
import { IAdminSchema } from "../../modal/interface/IAdminSchema"

/** Interface for Admin Service */
export interface IAdminService {
    getAdmin(payload: any) : Promise<IAdminDto>
    updateAdmin(payload: any, admin: IAdminSchema) : Promise<IAdminDto>
}