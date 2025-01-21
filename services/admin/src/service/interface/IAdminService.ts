import { IAdminDto } from "../../dto/adminServiceDto"
import { IAdminSchema } from "../../entities/IAdminSchema"

/** Interface for Admin Service */
export interface IAdminService {
    getAdmin(payload: any) : Promise<IAdminDto>
    updateAdmin(payload: any, admin: IAdminSchema) : Promise<IAdminDto>
}