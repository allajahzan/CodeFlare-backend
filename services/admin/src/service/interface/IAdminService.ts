import { IAdminDto } from "../../dto/adminServiceDto"
import { IAdminSchema } from "../../modal/interface/IAdminSchema"

/** Interface for Admin Service */
export interface IAdminService {
    getAdmin(user: any) : Promise<IAdminDto>
    updateAdmin(user: any, admin: IAdminSchema) : Promise<IAdminDto>
}