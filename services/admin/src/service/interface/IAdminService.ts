import { IAdminDto } from "../../dto/adminServiceDto"
import { IAdminSchema } from "../../modal/interface/IAdminSchema"

/** Interface for Admin Service */
export interface IAdminService {
    getAdmin(_id: string) : Promise<IAdminDto>
    updateAdmin(_id: string, admin: IAdminSchema) : Promise<IAdminDto>
}